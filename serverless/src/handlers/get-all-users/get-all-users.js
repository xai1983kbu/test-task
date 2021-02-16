"use strict";

const AWS = require("aws-sdk");
const { createResponse } = require("utilsLayer");

const dynamodb = new AWS.DynamoDB();
const { TABLE_NAME } = process.env;

//  -- Get list of users --
// So far it's unsorted by time created and less than 1Mb in size.
// 1 user takes less than 1Kb. I think we don't need use "KSUID" in "sk" for now.
exports.handler = async (event) => {
    try {
        if (event.httpMethod !== "GET") {
            throw new Error(
                `getAllUsers only accept GET method, you tried: ${event.httpMethod}`
            );
        }
        const items = await dynamodb.scan({ TableName: TABLE_NAME }).promise();
        let response = [];
        items.Items.forEach((item) => {
            const retrievedItem = AWS.DynamoDB.Converter.unmarshall(item);
            response.push({
                id: retrievedItem["id"],
                name: retrievedItem["name"],
                bestStarWarsPersonId: retrievedItem["bestStarWarsPersonId"],
                person: retrievedItem["data"],
            });
        });
        return createResponse(200, response);
    } catch (error) {
        console.log(error);
        return createResponse(400, { error: error.message });
    }
};
