"use strict";

const AWS = require("aws-sdk");
const { createResponse } = require("utilsLayer");

const dynamodb = new AWS.DynamoDB();
const { TABLE_NAME } = process.env;

exports.handler = async (event) => {
    const id = event.pathParameters ? event.pathParameters.id : null;
    try {
        if (event.httpMethod !== "PUT") {
            throw new Error(
                `updateUser only accept PUT method, you tried: ${event.httpMethod}`
            );
        }
        if (!id) {
            throw new Error(
                `"id" is required!`
            );
        }
        // Retrieve existing item
        const item = await dynamodb
            .getItem({
                TableName: TABLE_NAME,
                Key: {
                    pk: {
                        S: `user#${id}`,
                    },
                    sk: {
                        S: `ksuid#`,
                    },
                },
            })
            .promise();
        if (!item.Item)
            return createResponse(404, { error: `No found user with id: ${id}` });

        const retrievedItem = AWS.DynamoDB.Converter.unmarshall(item.Item);
        const bodyJson = JSON.parse(event.body);
        if (
            "pk" in bodyJson ||
            "sk" in bodyJson ||
            "type" in bodyJson ||
            "bestStarWarsPersonId" in bodyJson
        )
            throw Error("One of the provided property is not allowed!");

        const newItem = {
            ...retrievedItem,
            ...bodyJson,
        };

        if ("person" in bodyJson) {
            newItem["data"] = {
                ...retrievedItem["data"],
                ...bodyJson["person"],
            };
        }

        // Update item
        const all_old = await dynamodb
            .putItem({
                TableName: TABLE_NAME,
                Item: AWS.DynamoDB.Converter.marshall(newItem),
                ReturnValues: "ALL_OLD",
            })
            .promise();

        // Retrieve updated item
        const updatedItem = await dynamodb
            .getItem({
                TableName: TABLE_NAME,
                Key: {
                    pk: {
                        S: all_old["Attributes"]["pk"]["S"],
                    },
                    sk: {
                        S: all_old["Attributes"]["sk"]["S"],
                    },
                },
                ConsistentRead: true,
            })
            .promise();
        const retrievedUpdatedItem = AWS.DynamoDB.Converter.unmarshall(
            updatedItem.Item
        );
        const response = {
            id: retrievedUpdatedItem["id"],
            name: retrievedUpdatedItem["name"],
            bestStarWarsPersonId: retrievedUpdatedItem["bestStarWarsPersonId"],
            person: retrievedUpdatedItem["data"],
        };
        return createResponse(200, response);
    } catch (error) {
        console.log(error);
        return createResponse(400, { error: error.message });
    }
};
