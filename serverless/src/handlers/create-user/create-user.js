"use strict";

const AWS = require("aws-sdk");
const { createResponse } = require("utilsLayer");
const { getUser } = require("./utils/getUserFromSwapiDev");

const dynamodb = new AWS.DynamoDB();
const { TABLE_NAME } = process.env;

// create user if it doesn't already exist in dynamoDB
exports.handler = async (event, context) => {
    const id = event.pathParameters ? event.pathParameters.id : null;
    // https://stackoverflow.com/a/58702565/9783262
    const uuidv4 = context.awsRequestId;

    try {
        if (event.httpMethod !== "POST") {
            throw new Error(
                `putUser only accept POST method, you tried: ${event.httpMethod}`
            );
        }
        const bodyJson = JSON.parse(event.body) || {};
        if (!("id" in bodyJson) || !("name" in bodyJson))
            throw Error(`"id" and "name" properties are both required`);
        const { id, name } = bodyJson;
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId) || parsedId >= 84)
            throw Error(`id must be integer less than 84`);
        const { userFromSwapiDev, userFromSwapiDevId } = await getUser(id);
        await dynamodb
            .putItem({
                TableName: TABLE_NAME,
                // prevent overwrite on the next POST with the same "id" in body
                ConditionExpression: "attribute_not_exists(#hash_key)",
                ExpressionAttributeNames: {
                    "#hash_key": "pk",
                },
                Item: {
                    pk: {
                        S: `user#${userFromSwapiDevId}`,
                    },
                    sk: {
                        S: `ksuid#`,
                    },
                    type: {
                        S: "userFromSwapiDev",
                    },
                    data: {
                        M: AWS.DynamoDB.Converter.marshall(userFromSwapiDev),
                    },
                    bestStarWarsPersonId: {
                        S: userFromSwapiDevId,
                    },
                    name: {
                        S: name,
                    },
                    id: {
                        S: uuidv4,
                    },
                },
            })
            .promise();
        const createdItem = await dynamodb
            .getItem({
                TableName: TABLE_NAME,
                Key: {
                    pk: {
                        S: `user#${userFromSwapiDevId}`,
                    },
                    sk: {
                        S: `ksuid#`,
                    },
                },
            })
            .promise();
        const data = AWS.DynamoDB.Converter.unmarshall(createdItem.Item);
        const response = {
            id: data["id"],
            name: data["name"],
            bestStarWarsPersonId: data["bestStarWarsPersonId"],
            person: data.data,
        };
        return createResponse(200, response);
    } catch (error) {
        console.log(error);
        if (error.code === "ConditionalCheckFailedException")
            error.message = `User with choosen "bestStarWarsPersonId" already exists`;
        return createResponse(400, { error: error.message });
    }
};
