const {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} = require("@aws-sdk/client-s3");
const csv = require("@aws-sdk/client-s3");
const BUCKET = "s3-import-product-bucket";

const client = new S3Client({ region: "eu-central-1" });

const parseCSV = async (body) => {
  return new Promise((resolve, reject) => {
    body
      .pipe(csv())
      .on("data", (data) => console.log(data))
      .on("error", (e) => reject(e))
      .on("end", () => resolve(true));
  });
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
    await parseCSV(object.Body);
    await client.send(copyCmd);
    await client.send(deleteCmd);

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

  console.log("File parsed");
};
