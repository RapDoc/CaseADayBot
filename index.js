import { Client, GatewayIntentBits } from "discord.js";
import cron from "node-cron";
import dotenv from "dotenv";
import fs from "fs";
import express from "express";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const cases = JSON.parse(fs.readFileSync("./cases.json", "utf-8"));
let currentIndex = 0;

// Express server to keep Replit alive
const app = express();
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(3000, () => console.log("🌐 Web server running"));

// --- Scheduled Jobs ---
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const channel = client.channels.cache.get(process.env.CHANNEL_ID);

  // 6 AM: Send Question
  cron.schedule("10 14 * * *", () => {
    if (channel && currentIndex < cases.length) {
      const c = cases[currentIndex];
      channel.send(
        `📌 **Case ${currentIndex + 1}**\n**Topic:** ${c.topic}\n**Difficulty:** ${c.difficulty}\n\n**Question:** ${c.question}`,
      );
    }
  });

  // 12 PM: Send Hint
  cron.schedule("30 6 * * *", () => {
    if (channel && currentIndex < cases.length) {
      const c = cases[currentIndex];
      channel.send(`💡 **Hint for Case ${currentIndex + 1}:** ${c.hint}`);
    }
  });

  // 6 PM: Send Answer & Increment Index
  cron.schedule("30 12 * * *", () => {
    if (channel && currentIndex < cases.length) {
      const c = cases[currentIndex];
      channel.send(`✅ **Answer for Case ${currentIndex + 1}:** ${c.answer}`);
      currentIndex++; // Move to next case
    }
  });
});

client.login(process.env.DISCORD_TOKEN);
