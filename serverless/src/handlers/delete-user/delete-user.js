"use strict";

const AWS = require("aws-sdk");
const { createResponse } = require("utilsLayer");

const dynamodb = new AWS.DynamoDB();
const { TABLE_NAME } = process.env;

exports.handler = async (event) => {
    const id = event.pathParameters ? event.pathParameters.id : null;
    try {
        if (event.httpMethod !== "DELETE") {
            throw new Error(
                `deleteUser only accept DELETE method, you tried: ${event.httpMethod}`
            );
        }
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId) || parsedId >= 84)
            throw Error(`id must be integer less than 84`);
        await dynamodb
            .deleteItem({
                Key: {
                    pk: {
                        S: `user#${id}`,
                    },
                    sk: {
                        S: `ksuid#`,
                    },
                },
                TableName: TABLE_NAME,
            })
            .promise();
        return createResponse(200);
    } catch (error) {
        console.log(error);
        return createResponse(400, { error: error.message });
    }
};
