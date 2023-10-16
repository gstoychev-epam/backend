const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const dynamo = new AWS.DynamoDB.DocumentClient();
const id = uuidv4();

const put = async (item) => {
  const productPutResult = await dynamo
    .put({
      TableName: "products",
      Item: item,
    })
    .promise();

  const countPutResult = await dynamo
    .put({
      TableName: "stocks",
      Item: { product_id: id, count: parseInt(item.count) },
    })
    .promise();

  return { productPutResult, countPutResult };
};

module.exports.createProduct = async (event) => {
  const {
    title,
    price = 1,
    count = 0,
    description = "",
  } = event.queryStringParameters;

  if (!title) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: "Title field is mandatory",
    };
  }

  const item = {
    id,
    title,
    price,
    description,
    count,
  };

  try {
    const putResult = await put(item);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(
        {
          product: putResult.productPutResult,
          count: putResult.countPutResult,
        },
        null,
        2
      ),
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
