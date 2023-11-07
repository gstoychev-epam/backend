const {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} = require("@aws-sdk/client-s3");
const { SendMessageCommand, SQSClient } = require("@aws-sdk/client-sqs");
const { Readable } = require("stream");
const csv = require("csv-parser");

const BUCKET = "s3-import-product-bucket";
const SQS_QUEUE_URL = "catalogItemsQueue";

const s3client = new S3Client({ region: "eu-central-1" });
const sqsClient = new SQSClient({});

module.exports.importFileParser = async (event) => {
  const key = event.Records[0].s3.object.key;
  const getCmd = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  const copyCmd = new CopyObjectCommand({
    Bucket: BUCKET,
    CopySource: `${BUCKET}/${key}`,
    Key: key.replace("uploads", "parsed"),
  });
  const deleteCmd = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });

  const results = [];
  const readStream = new Readable({
    read() {
      s3client
        .send(getCmd)
        .then((data) => {
          const body = data.Body;

          body
            .on("data", (chunk) => {
              readStream.push(chunk);
            })
            .on("end", () => {
              readStream.push(null);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    },
  });
  try {
    readStream
      .pipe(csv())
      .on("data", (data) => {
        console.log(data);
        sqsClient.send(
          new SendMessageCommand({
            QueueUrl: SQS_QUEUE_URL,
            MessageBody: JSON.stringify(data),
          })
        );
      })
      .on("end", async () => {
        console.log("end", results);
        await s3client.send(copyCmd);
        await s3client.send(deleteCmd);
      });

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
