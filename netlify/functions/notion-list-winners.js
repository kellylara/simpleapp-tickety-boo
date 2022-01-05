const axios = require("axios");

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);

  const { apiToken, prizesDb } = body;
  const asText = body.asText || false;
  try {
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${prizesDb}/query`,
      {
        filter: {
          property: "WINNER",
          text: {
            is_not_empty: true,
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
    const winners = response.data.results.map((result) => {
      return result.properties.WINNER.rich_text[0].plain_text;
    });
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: asText
        ? JSON.stringify({ winners: winners.join("\n") })
        : JSON.stringify({ winners }),
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
