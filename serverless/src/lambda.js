"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const { getUser } = require("./utils/getUserFromSwapiDev");

const dynamodb = new AWS.DynamoDB();

exports.handler = async (event, context, callback) => {
  const id = event.pathParameters ? event.pathParameters.id : null;
  const { TABLE_NAME } = process.env;

  switch (event.httpMethod) {
    // create user if it doesn't already exist in dynamoDB
    case "POST":
      try {
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
                // S: JSON.stringify(userFromSwapiDev),
              },
              bestStarWarsPersonId: {
                S: userFromSwapiDevId,
              },
              name: {
                S: name,
              },
              id: {
                S: uuidv4(),
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
        // console.log(createdItem.Item);
        const data = AWS.DynamoDB.Converter.unmarshall(createdItem.Item);
        const response = {
          id: data["id"],
          name: data["name"],
          bestStarWarsPersonId: data["bestStarWarsPersonId"],
          person: data.data,
        };
        callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify(response),
        });
      } catch (error) {
        console.log(error);
        if (error.code === "ConditionalCheckFailedException")
          error.message = `User with choosen "bestStarWarsPersonId" already exists`;
        callback(null, {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ error: error.message }),
        });
      }
      break;
    // get user from dynamodb
    case "GET":
      try {
        if (id) {
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
          //   console.log(item.Item);
          if (!item.Item)
            callback(null, {
              statusCode: 404,
              headers: {
                "Access-Control-Allow-Origin": "*",
              },
              body: JSON.stringify({
                error: `No found user with "bestStarWarsPersonId": ${id}`,
              }),
            });
          const retrievedItem = AWS.DynamoDB.Converter.unmarshall(item.Item);
          const response = {
            id: retrievedItem["id"],
            name: retrievedItem["name"],
            bestStarWarsPersonId: retrievedItem["bestStarWarsPersonId"],
            person: retrievedItem.data,
          };
          callback(null, {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(response),
          });
        }

        //  -- Get list of users --
        // So far it's unsorted by time created and less than 1Mb in size.
        // 1 user takes less than 1Kb. I think we don't need use "KSUID" in "sk" for now.
        const items = await dynamodb.scan({ TableName: TABLE_NAME }).promise();
        // console.log(items);
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
        callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify(response),
        });
      } catch (error) {
        console.log(error);
        callback(null, {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ error: error.message }),
        });
      }
      break;
    case "PUT":
      try {
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
        // console.log(item.Item);
        if (!item.Item)
          callback(null, {
            statusCode: 404,
            headers: {
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: `No found user with id: ${id}` }),
          });

        const retrievedItem = AWS.DynamoDB.Converter.unmarshall(item.Item);
        // console.log("retrievedItem", retrievedItem);
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
        // console.log("newItem", newItem);

        if ("person" in bodyJson) {
          newItem["data"] = {
            ...retrievedItem["data"],
            ...bodyJson["person"],
          };
        }
        // console.log("data", newItem["data"]);

        const all_old = await dynamodb
          .putItem({
            TableName: TABLE_NAME,
            Item: AWS.DynamoDB.Converter.marshall(newItem),
            ReturnValues: "ALL_OLD",
          })
          .promise();
        // console.log(all_old);

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
        // console.log(updatedItem.Item.data.M.films);
        const retrievedUpdatedItem = AWS.DynamoDB.Converter.unmarshall(
          updatedItem.Item
        );
        const response = {
          id: retrievedUpdatedItem["id"],
          name: retrievedUpdatedItem["name"],
          bestStarWarsPersonId: retrievedUpdatedItem["bestStarWarsPersonId"],
          person: retrievedUpdatedItem["data"],
        };
        callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify(response),
        });
      } catch (error) {
        console.log(error);
        callback(null, {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ error: error.message }),
        });
      }
      break;
    case "DELETE":
      try {
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
        callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({}),
        });
      } catch (error) {
        console.log(error);
        callback(null, {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ error: error.message }),
        });
      }
      break;
    // http method is not supported
    default:
      const message = `Unsupported HTTP method ${event.httpMethod}`;
      callback(null, {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: message }),
      });
  }
};
