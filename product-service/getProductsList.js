module.exports.getProductsList = async (event) => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(
      [
        {
          id: 0,
          title: "Car brand",
          description: "Maybe cool car",
          price: 1,
        },
        {
          id: 1,
          title: "Own Product 2",
          description: "Super cool",
          price: 46532,
        },
        {
          id: 2,
          title: "Car brand",
          description: "Definitely cool car",
          price: 25400,
        },
      ],
      null,
      2
    ),
  };
};
