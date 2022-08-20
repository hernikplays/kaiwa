import axios from "axios";
import {
  Client,
  ApplicationCommandType,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Message,
  TextChannel,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../interface/command";
import { toHiragana, toRomaji } from "wanakana";

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

export const Kviz: Command = {
  name: "kviz",
  description:
    "Nechte se s kamarády vyzkoušet z nějakého jazyka! Hádejte náhodná slova.",
  dmPermission: false,
  options: [
    {
      name: "kanji",
      type: ApplicationCommandOptionType.Subcommand,
      description: "Kvíz z náhodných znaků kandži",
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "uroven",
          description: "Zvolte úroveň kvízu",
          required: true,
          choices: [
            {
              name: "1. třída",
              value: "grade-1",
            },
            {
              name: "2. třída",
              value: "grade-2",
            },
            {
              name: "3. třída",
              value: "grade-3",
            },
            {
              name: "4. třída",
              value: "grade-4",
            },
            {
              name: "5. třída",
              value: "grade-5",
            },
            {
              name: "6. třída",
              value: "grade-6",
            },
          ],
        },
      ],
    },
    {
      name: "hiragana",
      type: ApplicationCommandOptionType.Subcommand,
      description: "Přepište výslovnost kandži",
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "uroven",
          description: "Zvolte úroveň kvízu",
          required: true,
          choices: [
            {
              name: "1. třída",
              value: "grade-1",
            },
            {
              name: "2. třída",
              value: "grade-2",
            },
            {
              name: "3. třída",
              value: "grade-3",
            },
            {
              name: "4. třída",
              value: "grade-4",
            },
            {
              name: "5. třída",
              value: "grade-5",
            },
            {
              name: "6. třída",
              value: "grade-6",
            },
          ],
        },
      ],
    },
  ],
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: ChatInputCommandInteraction) => {
    const level =
      interaction.options.get("uroven")?.value?.toString() ?? "chyba";
    const cmd = interaction.options.getSubcommand();

    if (cmd === "kanji") {
      // START KANDZI KVIZ
      const kanji = await (
        await axios.get("https://kanjiapi.dev/v1/kanji/" + level)
      ).data;

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("start")
          .setLabel("Start")
          .setStyle(ButtonStyle.Primary)
      );

      let trida = "1";
      switch (level) {
        case "grade-2":
          trida = "2";
          break;
        case "grade-3":
          trida = "3";
          break;
        case "grade-4":
          trida = "4";
          break;
        case "grade-5":
          trida = "5";
          break;
        case "grade-6":
          trida = "6";
          break;

        default:
          break;
      }

      const mes = await interaction.editReply({
        components: [row],
        embeds: [
          {
            title: `Kvíz kandži pro ${trida}. třídu`,
            description:
              "Klikni na 'Start' pro start.\nKdokoliv se může přidat a hádat v tomto kanálu.",
          },
        ],
      });

      const filter = (i: { customId: string; user: { id: string } }) =>
        i.customId === "start";

      const collector = mes.createMessageComponentCollector({
        filter,
        time: 15000,
      });

      collector?.on("collect", async (i) => {
        poslatKanjiKviz(
          (await client.channels.fetch(i.channelId)) as TextChannel,
          kanji
        );
        i.update("e");
      });
      // END KANDZI KVIZ
    } else if (cmd === "hiragana") {
      // START HIRAGANA KVIZ
      const kanji = await (
        await axios.get("https://kanjiapi.dev/v1/kanji/" + level)
      ).data;

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("start")
          .setLabel("Start")
          .setStyle(ButtonStyle.Primary)
      );

      let trida = "1";
      switch (level) {
        case "grade-2":
          trida = "2";
          break;
        case "grade-3":
          trida = "3";
          break;
        case "grade-4":
          trida = "4";
          break;
        case "grade-5":
          trida = "5";
          break;
        case "grade-6":
          trida = "6";
          break;

        default:
          break;
      }

      const mes = await interaction.editReply({
        components: [row],
        embeds: [
          {
            title: `Kvíz kandži na hiraganu pro ${trida}. třídu`,
            description:
              "Klikni na 'Start' pro start.\nKdokoliv se může přidat a hádat v tomto kanálu.",
          },
        ],
      });

      const filter = (i: { customId: string; user: { id: string } }) =>
        i.customId === "start";

      const collector = mes.createMessageComponentCollector({
        filter,
        time: 15000,
      });

      collector?.on("collect", async (i) => {
        poslatHiraganaKviz(
          (await client.channels.fetch(i.channelId)) as TextChannel,
          kanji
        );
        i.deferUpdate();
      });
      // END HIRAGANA KVIZ
    }
  },
};
let j = 1;
let points: { [key: string]: number } = {};
let guessed: string[] = [];

async function poslatKanjiKviz(
  channel: TextChannel,
  kanji: string[]
): Promise<void> {
  if (j === 5) {
    // Ukončit při max kolech
    // TODO: vlastní max
    let vysledky = "";
    Object.keys(points).forEach((e) => {
      if (points[e] > 0) vysledky += `<@${e}> - ${points[e]} bodů`;
    });

    channel.send({
      embeds: [
        {
          title: "Finální výsledky",
          description: vysledky,
          footer: {
            text: "Zobrazují se pouze hráči s počtem bodů vyšším než nula.",
          },
        },
      ],
    });
    points = {};
    return;
  }
  const random = kanji[Math.floor(Math.random() * kanji.length)];
  const original = await channel.send({
    embeds: [
      {
        title: `Uhádni význam kandži: ${random}`,
        footer: { text: "Musíš hádat anglicky" },
        color: 0xe67067,
      },
    ],
  });

  const meanings: string[] = (
    await axios.get(encodeURI("https://kanjiapi.dev/v1/kanji/" + random))
  ).data["meanings"];

  console.log(meanings);

  const filter = (m: Message) => m.channelId === channel.id && !m.author.bot;
  const collector = channel.createMessageCollector({ filter, time: 15000 });
  collector?.on("collect", (m) => {
    if (meanings.includes(m.content.toLowerCase())) {
      if (points[m.author.id] === undefined) points[m.author.id] = 0;
      if (points[m.author.id] === j + 1) return; // uživatel již správně uhodl
      points[m.author.id] += 1;
      guessed.push(m.author.id);
    }
  });

  collector?.on("end", () => {
    let p = "";
    guessed.forEach((user) => {
      p += `<@${user}> - ${points[user]} bodů\n`;
    });
    guessed = [];
    original.edit({
      embeds: [
        {
          title: `Kolo ${j}.`,
          color: 0x67e689,
          fields: [
            {
              name: `Kandži \`${random}\``,
              value: `Význam: ${meanings.join(", ")}`,
            },
            { name: "Správně uhodli:", value: p === "" ? "Nikdo" : p },
          ],
        },
      ],
    });
    j += 1;
    poslatKanjiKviz(channel, kanji);
  });
}

async function poslatHiraganaKviz(
  channel: TextChannel,
  kanji: string[]
): Promise<void> {
  if (j === 5) {
    // Ukončit při max kolech
    // TODO: vlastní max
    let vysledky = "";
    Object.keys(points).forEach((e) => {
      if (points[e] > 0) vysledky += `<@${e}> - ${points[e]} bodů`;
    });

    channel.send({
      embeds: [
        {
          title: "Finální výsledky",
          description: vysledky,
          footer: {
            text: "Zobrazují se pouze hráči s počtem bodů vyšším než nula.",
          },
        },
      ],
    });
    points = {};
    return;
  }
  const random = kanji[Math.floor(Math.random() * kanji.length)];
  const original = await channel.send({
    embeds: [
      {
        title: `Přepiš kandži do hiragany: ${random}`,
        footer: {
          text: "Není nutná japonská klávesnice, počítá se zápis kun'jomi i on'jomi",
        },
        color: 0xe67067,
      },
    ],
  });

  const r = (
    await axios.get(encodeURI("https://kanjiapi.dev/v1/kanji/" + random))
  ).data;
  const meanings: string[] = r["kun_reading"].concat(r["on_readings"]);
  meanings.forEach((m) => {
    meanings.push(toRomaji(m));
    meanings.push(toHiragana(m));
  });
  console.log(meanings);

  const filter = (m: Message) => m.channelId === channel.id && !m.author.bot;
  const collector = channel.createMessageCollector({ filter, time: 15000 });
  collector?.on("collect", (m) => {
    if (meanings.includes(m.content.toLowerCase())) {
      if (points[m.author.id] === undefined) points[m.author.id] = 0;
      if (points[m.author.id] === j) return; // uživatel již správně uhodl
      points[m.author.id] += 1;
      guessed.push(m.author.id);
    }
  });

  collector?.on("end", () => {
    let p = "";
    guessed.forEach((user) => {
      p += `<@${user}> - ${points[user]} bodů\n`;
    });
    guessed = [];
    original.edit({
      embeds: [
        {
          title: `Kolo ${j}.`,
          color: 0x67e689,
          fields: [
            {
              name: `Kandži \`${random}\``,
              value: `Hiragana (kun, on): ${meanings.join("\n")}`,
            },
            { name: "Správně uhodli:", value: p === "" ? "Nikdo" : p },
          ],
        },
      ],
    });
    j += 1;
    poslatHiraganaKviz(channel, kanji);
  });
}
