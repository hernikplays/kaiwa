import {
  Client,
  ApplicationCommandType,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../interface/command";

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

export const Ping: Command = {
  name: "ping",
  description: "Pong!",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: ChatInputCommandInteraction) => {
    const content = "Pong!";

    await interaction.followUp({
      ephemeral: true,
      content,
    });
  },
};
