const axios = require("axios");

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);
  const { apiToken, prizes, winner, selectedPrize } = body;
  
  try {
    parsedPrizes = JSON.parse(prizes.replace(/'/g, '"'));
  } catch {
    parsedPrizes = prizes;
  }
  const selectedPrizeId = parsedPrizes.find(
    (prize) => prize.item === selectedPrize
  ).id;

  try {
    await axios.patch(
      `https://api.notion.com/v1/pages/${selectedPrizeId}`,
      {
        properties: {
          WINNER: {
            type: "rich_text",
            rich_text: [{ type: "text", text: { content: winner } }],
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
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "OK",
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
