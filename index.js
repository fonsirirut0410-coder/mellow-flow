require("dotenv").config();

const express = require("express");
const line = require("@line/bot-sdk");
const OpenAI = require("openai");

const app = express();

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Mellow Flow is running 🌊");
});

app.get("/webhook", (req, res) => {
  res.send("Webhook route exists");
});

app.post("/webhook", line.middleware(config), async (req, res) => {
  res.sendStatus(200);

  for (const event of req.body.events) {
    if (event.type !== "message") continue;
    if (event.message.type !== "text") continue;

    const userMessage = event.message.text;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "คุณคือ Mellow Flow 🌊 AI เพื่อนที่อบอุ่นและช่วยจัดการงาน",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      });

      const reply = response.choices[0].message.content;

      await client.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: "text",
            text: reply,
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
