const AWS = require("aws-sdk");
const { _ } = require("lodash");
const dynamo = new AWS.DynamoDB.DocumentClient();

const scan = async (tableName) => {
  const scanResult = await dynamo
    .scan({
      TableName: tableName,
    })
    .promise();
  return scanResult;
};

module.exports.getProductsList = async (event) => {
  try {
    const products = await scan("products");
    const stocks = await scan("stocks");
    const productsResult = products.Items.map((p) => {
      return _.assign(p, {
        count: _.find(stocks.Items, { product_id: p.id })?.count || 0,
      });
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(productsResult, null, 2),
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
