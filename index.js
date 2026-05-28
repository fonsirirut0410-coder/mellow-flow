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
  channelAccessToken: config.channelAccessToken,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Mellow Flow is running 🌊");
});

app.post(
  "/webhook",
  line.middleware(config),
  async (req, res) => {
    try {
      const events = req.body.events;

      for (const event of events) {
        if (event.type !== "message") continue;

        if (event.message.type !== "text") continue;

        const userMessage = event.message.text;

        const response = await openai.chat.completions.create({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content:
                "You are Mellow Flow, a warm productivity and emotional support buddy.",
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
        });

        const reply =
          response.choices[0].message.content;

        await client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: "text",
              text: reply,
            },
          ],
        });
      }

      res.sendStatus(200);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
