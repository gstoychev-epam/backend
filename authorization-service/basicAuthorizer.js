const generatePolicy = (effect, resource) => {
  return {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: resource,
      },
    ],
  };
};

const generateResponse = (principalId, effect, resource) => {
  return {
    principalId,
    policyDocument: generatePolicy(effect, resource),
    context: {
      stringKey: "value",
      numberKey: "1",
      booleanKey: "true",
    },
  };
};

module.exports.basicAuthorizer = async (event) => {
  const username = process.env.USER_ID;
  const storedUserPassword = process.env[username];
  const { methodArn, authorizationToken } = event;
  const token = authorizationToken.replace("Basic ", "");
  const [user, password] = Buffer.from(token, "base64").toString().split(":");
  const itMatch = storedUserPassword === password;
  const response = itMatch
    ? generateResponse(user, "Allow", methodArn)
    : generateResponse(user, "Deny", methodArn);

  console.log(JSON.stringify(response));

  return response;
};
