const axios = require("axios");

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);
  const { apiToken, prizesDb } = body;
  const numberToGenerate = body.numberToGenerate || 30;

  try {
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${prizesDb}/query`,
      {
        filter: {
          property: "WINNER",
          text: {
            is_empty: true,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Notion-Version": "2021-08-16",
        },
      }
    );
    const prizes = response.data.results.map((result) => {
      return {
        id: result.id,
        item: result.properties.ITEM.title[0].plain_text,
      };
    });
    while (prizes.length < numberToGenerate) {
      prizes.push({id: "", item: ""});
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prizes,
        count: response.data.results.length,
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Error from Notion API",
        details: err.data,
      }),
    };
  }
};
