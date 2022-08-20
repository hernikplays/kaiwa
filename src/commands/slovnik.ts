import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  ApplicationCommandOptionType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  SelectMenuInteraction,
} from "discord.js";
import { Command } from "../interface/command";
import JishoAPI, { JishoAPIResult } from "unofficial-jisho-api";
import sdapi from "sdapi";
import { WordResult } from "sdapi/lib/dictionary";
import { Seznam, Jazyk } from "../lib/seznam/seznam";

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

export const Slovnik: Command = {
  name: "slovnik",
  description: "Umožňuje prohledávat slovníky určitých jazyků",
  dmPermission: true,
  options: [
    {
      name: "jazyk",
      description: "Jazyk slovníku, ve kterém chceme hledat",
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: "Japonština (jisho)",
          value: "jisho",
        },
        {
          name: "Španělština (SpanishDict)",
          value: "sd",
        },
        {
          name: "Angličtina (Seznam Slovník)",
          value: "seznam",
        },
      ],
      required: true,
    },
    {
      name: "slovo",
      description: "Slovo, které chcete vyhledat",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {
    const q = interaction.options.get("slovo")?.value?.toString();

    if (q == undefined) {
      return await interaction.followUp("Chyba");
    }
    if (interaction.options.get("jazyk")?.value == "jisho") {
      // START JISHO
      const jisho = new JishoAPI();

      try {
        const r = await jisho.searchForPhrase(q);
        console.log(r.data[0].senses[0]);
        let vyznamy = "";
        let f = 0;
        r.data[j].senses.forEach((s) => {
          f += 1;
          vyznamy += `${f}. ${s.english_definitions.join(", ")}\n`;
        });

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("prev")
            .setLabel("Předchozí")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("next")
            .setLabel("Další")
            .setStyle(ButtonStyle.Primary)
        );

        const mes = await interaction.editReply({
          components: [row],
          embeds: [
            {
              title: `${interaction.user.username} vyhledal/a \`${q}\``,
              fields: [
                {
                  name: r.data[0].japanese[0].word,
                  value: `${r.data[0].jlpt.join(", ").toUpperCase()} ${
                    r.data[0].is_common ? ", běžné" : ""
                  }, ${r.data[0].tags.join(", ")}`,
                },
                { name: "Čtení", value: r.data[0].japanese[0].reading },
                { name: "Významy", value: vyznamy },
              ],
              footer: {
                text: `Strana 1/${r.data.length} | Vyhledáno na Jisho.org pomocí unofficial-jisho-api`,
              },
            },
          ],
        });

        const filter = (i: { customId: string; user: { id: string } }) =>
          (i.customId === "next" || i.customId === "prev") &&
          i.user.id === interaction.user.id;

        const collector = mes.createMessageComponentCollector({
          filter,
          time: 15000,
        });

        collector?.on("collect", async (i) => {
          j = 0;
          collector.stop();
          newPageJP(i, r, q);
        });
      } catch (error) {
        await interaction.followUp("Chyba při hledání.");
        console.error(error);
      }
      // END JISHO
    } else if (interaction.options.get("jazyk")?.value == "sd") {
      const r = await sdapi.translate(q);
      let druh = "";
      switch (r[0].part) {
        case "verb":
          druh = "sloveso";
          break;
        case "noun":
          druh = "podst. jm.";
          break;
        case "adjective":
          druh = "příd. jm.";
          break;
        case "pronoun":
          druh = "zájmeno";
          break;
        case "adverb":
          druh = "příslovce";
          break;
        case "conjunction":
          druh = "spojka";
          break;
        case "particle":
          druh = "částice";
          break;
        case "interjection":
          druh = "citoslovce";
          break;
        default:
          druh = r[0].part;
          break;
      }

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("Předchozí")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Další")
          .setStyle(ButtonStyle.Primary)
      );

      const mes = await interaction.editReply({
        components: [row],
        embeds: [
          {
            title: `${interaction.user.username} vyhledal/a \`${q}\``,
            fields: [
              {
                name: r[0].word,
                value: `${
                  r[0].gender !== undefined ? r[0].gender + ". " : ""
                }${druh}`,
              },
              { name: "Význam", value: r[0].meaning },

              {
                name: "Příklad",
                value: `*${r[j].examples[0].original}*\n${r[j].examples[0].translated}`,
              },
            ],
            footer: {
              text: `Strana 1/${r.length} | Vyhledáno na SpanishDict pomocí sdapi`,
            },
          },
        ],
      });

      const filter = (interaction: {
        customId: string;
        user: { id: string };
      }) =>
        (interaction.customId === "next" || interaction.customId === "prev") &&
        interaction.user.id === interaction.user.id;

      const collector = mes.createMessageComponentCollector({
        filter,
        time: 15000,
      });

      collector?.on("collect", async (i) => {
        j = 0;
        collector.stop();
        newPageES(i, r, q);
      });
    } else if (interaction.options.get("jazyk")?.value === "seznam") {
      const s = new Seznam(Jazyk.Anglictina);
      const v = await s.vyhledat(q);
      if (v == null) {
        await interaction.editReply({
          embeds: [
            { title: "Chyba!", description: "Nic nenalezeno", color: 0xe02440 },
          ],
        });
      } else {
        await interaction.editReply({
          embeds: [
            {
              title: `${interaction.user.username} vyhledal/a \`${q}\``,
              fields: [
                { name: "Výslovnost", value: v?.vyslovnost ?? "N/A" },
                { name: "Významy", value: v?.vyznamy.join("\n") ?? "N/A" },
              ],
              footer: {text: "Informace ze slovnik.seznam.cz"}
            },
          ],
        });
      }
    } else {
      console.log(q);
      await interaction.followUp("Chyba");
    }
  },
};
let j = 0;
async function newPageJP(
  i: ButtonInteraction | SelectMenuInteraction,
  r: JishoAPIResult,
  q: string
): Promise<void> {
  if (i.customId === "next") {
    if (j + 1 >= r.data.length) j = 0;
    else j += 1;
  } else {
    if (j === 0) j = r.data.length - 1;
    else j -= 1;
  }

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("Předchozí")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("next")
      .setLabel("Další")
      .setStyle(ButtonStyle.Primary)
  );
  console.log(r.data[j]);
  console.log(r.data[j].senses);
  let vyznamy = "";
  let f = 0;
  r.data[j].senses.forEach((s) => {
    f += 1;
    vyznamy += `${f}. ${s.english_definitions.join(", ")}\n`;
  });

  const mes = await i.update({
    components: [row],
    embeds: [
      {
        title: `${i.user.username} vyhledal/a \`${q}\``,
        fields: [
          {
            name: r.data[j].japanese[0].word,
            value: `${r.data[j].jlpt.join(", ").toUpperCase()} ${
              r.data[j].is_common ? ", běžné" : ""
            } ${r.data[j].tags.length > 0 ? "," : ""} ${r.data[j].tags.join(
              ", "
            )}`,
          },
          { name: "Výslovnost", value: r.data[0].japanese[0].reading },
          { name: "Významy", value: vyznamy },
        ],
        footer: {
          text: `Strana ${j + 1}/${
            r.data.length
          } | Vyhledáno na Jisho.org pomocí unofficial-jisho-api`,
        },
      },
    ],
  });

  const filter = (interaction: { customId: string; user: { id: string } }) =>
    (interaction.customId === "next" || interaction.customId === "prev") &&
    interaction.user.id === i.user.id;

  const collector = mes.createMessageComponentCollector({
    filter,
    time: 15000,
  });

  collector?.on("collect", async (i) => {
    collector.stop();
    newPageJP(i, r, q);
  });
}

async function newPageES(
  i: ButtonInteraction | SelectMenuInteraction,
  r: WordResult[],
  q: string
): Promise<void> {
  if (i.customId === "next") {
    if (j + 1 >= r.length) j = 0;
    else j += 1;
  } else {
    if (j === 0) j = r.length - 1;
    else j -= 1;
  }

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("Předchozí")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("next")
      .setLabel("Další")
      .setStyle(ButtonStyle.Primary)
  );

  let druh = "";
  switch (r[j].part) {
    case "verb":
      druh = "sloveso";
      break;
    case "noun":
      druh = "podst. jm.";
      break;
    case "adjective":
      druh = "příd. jm.";
      break;
    case "pronoun":
      druh = "zájmeno";
      break;
    case "adverb":
      druh = "příslovce";
      break;
    case "conjunction":
      druh = "spojka";
      break;
    case "particle":
      druh = "částice";
      break;
    case "interjection":
      druh = "citoslovce";
      break;
    default:
      druh = r[j].part;
      break;
  }
  const mes = await i.update({
    components: [row],
    embeds: [
      {
        title: `${i.user.username} vyhledal/a \`${q}\``,
        fields: [
          {
            name: r[j].word,
            value: `${
              r[j].gender !== undefined ? r[j].gender + ". " : ""
            }${druh}`,
          },
          { name: "Význam", value: r[j].meaning },
          {
            name: "Příklad",
            value: `*${r[j].examples[0].original}*\n${r[j].examples[0].translated}`,
          },
        ],
        footer: {
          text: `Strana ${j + 1}/${
            r.length
          } | Vyhledáno na SpanishDict pomocí sdapi`,
        },
      },
    ],
  });

  const filter = (interaction: { customId: string; user: { id: string } }) =>
    (interaction.customId === "next" || interaction.customId === "prev") &&
    interaction.user.id === i.user.id;

  const collector = mes.createMessageComponentCollector({
    filter,
    time: 15000,
  });

  collector?.on("collect", async (i) => {
    collector.stop();
    newPageES(i, r, q);
  });
}
