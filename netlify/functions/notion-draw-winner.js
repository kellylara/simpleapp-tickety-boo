const axios = require("axios");

/**
 * Code based on Tickety Boo v1 and the following:
 * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */
function getTicketArray(ticketData) {
  const names = [];
  ticketData.forEach((ticket) => {
    const id = ticket.id;
    const name = ticket.properties.NAME.title[0].plain_text;
    for (const n of Array(ticket.properties.TICKETS.number)) {
      names.push({ id: id, name: name });
    }
  });
  return names;
}
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
function getRandomTicket(ticketData) {
  const tickets = getTicketArray(ticketData);
  shuffleArray(tickets);
  const randomIndex = Math.floor(Math.random() * tickets.length);
  return tickets[randomIndex];
}

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);

  const { apiToken, ticketsDb } = body;
  try {
    const ticketResponse = await axios.post(
      `https://api.notion.com/v1/databases/${ticketsDb}/query`,
      {
        filter: {
          property: "DRAWN",
          text: {
            equals: "FALSE",
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
    const ticket = getRandomTicket(ticketResponse.data.results);
    const updateResponse = await axios.patch(
      `https://api.notion.com/v1/pages/${ticket.id}`,
      {
        properties: {
          DRAWN: {
            type: "rich_text",
            rich_text: [{ type: "text", text: { content: "TRUE" } }],
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
    const isTicketDrawn = updateResponse.data.properties.DRAWN.rich_text[0].plain_text;
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        winner: ticket.name,
        isTicketDrawn: isTicketDrawn,
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
