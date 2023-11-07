const {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} = require("@aws-sdk/client-s3");
const { SendMessageCommand, SQSClient } = require("@aws-sdk/client-sqs");
const csv = require("csv-parser");
const BUCKET = "s3-import-product-bucket";
const SQS_QUEUE_URL = "catalogItemsQueue";

const client = new S3Client({ region: "eu-central-1" });
const sqsClient = new SQSClient({});

const parseCSV = async (body) => ({
  each: (callback) =>
    new Promise((resolve, reject) => {
      body
        .pipe(csv())
        .on("data", (data) => callback(data))
        .on("error", (e) => reject(e))
        .on("end", () => resolve(true));
    }),
});
const createCommand = ({ title, description, price, count }, message) => {
  console.log("command", {
    Title: {
      DataType: "String",
      StringValue: title,
    },
    Description: {
      DataType: "String",
      StringValue: description,
    },
    Price: {
      DataType: "Number",
      StringValue: price,
    },
    Count: {
      DataType: "Number",
      StringValue: count,
    },
  });
  return new SendMessageCommand({
    QueueUrl: SQS_QUEUE_URL,
    MessageAttributes: {
      Title: {
        DataType: "String",
        StringValue: title,
      },
      Description: {
        DataType: "String",
        StringValue: description,
      },
      Price: {
        DataType: "Number",
        StringValue: price,
      },
      Count: {
        DataType: "Number",
        StringValue: count,
      },
    },
    MessageBody: message,
  });
};

const sendMessage = async (product) => {
  console.log(product, JSON.stringify(product));

  sqsClient
    .send(
      createCommand(
        { title: "Big", description: "shit", price: 2, count: 3 },
        JSON.stringify(product)
      )
    )
    .then("ok")
    .catch((e) => console.log(e.message, e));
};

module.exports.importFileParser = async (event) => {
  const key = event.Records[0].s3.object.key;
  const getObjectCmd = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  const copyCmd = new CopyObjectCommand({
    Bucket: BUCKET,
    CopySource: `${BUCKET}/${key}`,
    Key: key.replace("uploads", "parsed"),
  });
  const deleteCmd = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });

  try {
    const object = await client.send(getObjectCmd);
    await client.send(copyCmd);
    await client.send(deleteCmd);
    console.log(object);
    await parseCSV(object.Body).each(sendMessage);

    console.log("File parsed");

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: err.message,
    };
  }
};
