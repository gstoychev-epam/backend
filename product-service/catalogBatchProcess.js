const { PublishCommand, SNSClient } = require("@aws-sdk/client-sns");
const createProduct = require("./createProduct");

const snsClient = new SNSClient({});
const smsSendCmd = new PublishCommand({
  Message: "Products added to DB",
  TopicArn: "arn:aws:sns:eu-central-1:411280288885:createProductTopic",
});

module.exports.catalogBatchProcess = async (event) => {
  for (let index = 0; index < event.Records.length; index++) {
    const record = event.Records[index];

    try {
      const productInfo = JSON.parse(record.body);

      createProduct(productInfo);
    } catch (e) {
      console.log(e);
    }
  }

  try {
    await snsClient.send(smsSendCmd);
  } catch (e) {
    console.log(e);
  }

  console.log("File parsed");
};
