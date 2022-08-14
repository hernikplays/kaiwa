import { Client, GatewayIntentBits } from "discord.js";
import ready from "./listeners/ready";
import "dotenv/config";
import interactionCreate from "./listeners/interactionCreate";

console.log("Bot is starting...");

const client = new Client({
  intents: [GatewayIntentBits.GuildMessages],
});

ready(client);
interactionCreate(client);

client.login(process.env.TOKEN);
