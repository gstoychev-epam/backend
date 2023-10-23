const AWS = require("aws-sdk");
const { _ } = require("lodash");
const dynamo = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

const query = async (tableName, id) => {
  const queryResult = await dynamo
    .get({
      TableName: tableName,
      Key: {
        id: id,
        title: "First Product",
      },
    })
    .promise();
  return queryResult;
};

module.exports.getProductsById = async (event) => {
  try {
    const { productId } = event.pathParameters;
    const queryResult = await query("products", productId);

    if (queryResult.Item) {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(queryResult.Item, null, 2),
      };
    }

    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: "Not found",
    };
  } catch {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: "Internal server error",
    };
  }
};
