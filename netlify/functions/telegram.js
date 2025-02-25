// netlify/functions/telegram.js
exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  
  try {
    const telegramData = JSON.parse(event.body);
    const chatId = telegramData.message?.chat?.id;
    const text = telegramData.message?.text;
    
    // Process the message (e.g., log it or save it to a database)
    console.log("Received Telegram message:", { chatId, text });
    
    return { statusCode: 200, body: "OK" };
  } catch (error) {
    console.error("Error processing Telegram webhook:", error);
    return { statusCode: 500, body: "Server Error" };
  }
};
