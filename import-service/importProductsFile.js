const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
// ...
const BUCKET = "s3-import-product-bucket";

module.exports.importProductsFile = async (event) => {
  const { name } = event.queryStringParameters;

  const client = new S3Client({ region: "eu-central-1" });
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: `uploads/${name}`,
  });
  const url = await getSignedUrl(client, command, { expiresIn: 3600 });

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET PUT",
    },
    body: JSON.stringify(url, null, 2),
  };
};
