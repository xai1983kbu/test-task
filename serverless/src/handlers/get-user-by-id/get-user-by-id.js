"use strict";

const AWS = require("aws-sdk");
const { createResponse } = require("utilsLayer");

const dynamodb = new AWS.DynamoDB();
const { TABLE_NAME } = process.env;

exports.handler = async (event) => {
    const id = event.pathParameters ? event.pathParameters.id : null;
    try {
        if (event.httpMethod !== "GET") {
            throw new Error(
                `getUserById only accept GET method, you tried: ${event.httpMethod}`
            );
        }
        if (!id) {
            throw new Error(
                `"id" is required!`
            );
        }
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId) || parsedId >= 84)
            throw Error(`id must be integer less than 84`);
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
            return createResponse(404, {
                error: `No found user with "bestStarWarsPersonId": ${id}`,
            });
        const retrievedItem = AWS.DynamoDB.Converter.unmarshall(item.Item);
        const response = {
            id: retrievedItem["id"],
            name: retrievedItem["name"],
            bestStarWarsPersonId: retrievedItem["bestStarWarsPersonId"],
            person: retrievedItem.data,
        };
        return createResponse(200, response);
    } catch (error) {
        console.log(error);
        return createResponse(400, { error: error.message });
    }
};
