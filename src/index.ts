import { Client, IntentsBitField } from "discord.js";
import ready from "./listeners/ready";
import "dotenv/config";
import interactionCreate from "./listeners/interactionCreate";

/*

            Copyright (C) 2022 Matyáš Caras a přispěvatelé

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

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
