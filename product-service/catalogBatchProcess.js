const { PublishCommand, SNSClient } = require("@aws-sdk/client-sns");
const createProduct = require("./createProduct");

const snsClient = new SNSClient({});
const snsSendCmd = new PublishCommand({
  Message: "Products added to DB",
  TopicArn: "arn:aws:sns:eu-central-1:411280288885:createProductTopic",
});

module.exports.catalogBatchProcess = async (event) => {
  for (let index = 0; index < event.Records.length; index++) {
    const record = event.Records[index];

    try {
      const productInfo = JSON.parse(record.body);
      console.log("Process entry: ", productInfo);
      createProduct(productInfo);
    } catch (e) {
      console.log(e);
    }
  }

  try {
    await snsClient.send(snsSendCmd);
  } catch (e) {
    console.log(e);
  }

  console.log("File parsed");
};
