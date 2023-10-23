const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const { faker } = require("@faker-js/faker");
AWS.config.update({ region: "eu-central-1" });
const dynamo = new AWS.DynamoDB.DocumentClient();

const put = async (item) => {
  await dynamo
    .put({
      TableName: "products",
      Item: item,
    })
    .promise();

  await dynamo
    .put({
      TableName: "stocks",
      Item: { product_id: item.id, count: parseInt(item.count) },
    })
    .promise();
};

async function populate() {
  for (i = 0; i < 10; i++) {
    const item = {
      id: uuidv4(),
      title: faker.commerce.product(),
      description: faker.commerce.productDescription(),
      price: faker.commerce.price({ min: 10, max: 1500 }),
      count: faker.commerce.price({ min: 1, max: 30 }),
    };

    await put(item);
  }
}

populate();
