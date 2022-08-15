import { Client, IntentsBitField } from "discord.js";
import ready from "./listeners/ready";
import "dotenv/config";
import interactionCreate from "./listeners/interactionCreate";

console.log("Bot is starting...");

const myIntents = new IntentsBitField();
myIntents.add(
  IntentsBitField.Flags.MessageContent,
  IntentsBitField.Flags.GuildMessages
);

const client = new Client({
  intents: myIntents,
});

ready(client);
interactionCreate(client);

client.login(process.env.TOKEN);
