import axios from "axios";
import {
  CommandInteraction,
  Client,
  ApplicationCommandType,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Message,
  TextChannel,
} from "discord.js";
import { Command } from "../interface/command";

export const Kviz: Command = {
  name: "kviz",
  description:
    "Nechte se s kamarády vyzkoušet z nějakého jazyka! Hádejte náhodná slova.",
  dmPermission: false,
  options: [
    {
      name: "japonsky",
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
              value: "1c",
            },
          ],
        },
      ],
    },
  ],
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {
    const level =
      interaction.options.get("uroven")?.value?.toString() ?? "chyba";
    if (level === "1c") {
      // first grade
      const kanji = await (
        await axios.get("https://kanjiapi.dev/v1/kanji/grade-1")
      ).data;

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("start")
          .setLabel("Start")
          .setStyle(ButtonStyle.Primary)
      );

      const mes = await interaction.editReply({
        components: [row],
        embeds: [
          {
            title: `Kvíz kandži pro 1. třídu`,
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
        poslatKviz(
          (await client.channels.fetch(i.channelId)) as TextChannel,
          kanji
        );
        i.update("e");
      });
    }
  },
};
let j = 1;
let points: { [key: string]: number } = {};
let guessed: string[] = [];

async function poslatKviz(
  channel: TextChannel,
  kanji: string[]
): Promise<void> {
  if (j === 5) {
    // Ukončit při max kolech
    // TODO: vlastní max
    let vysledky = "";
    Object.keys(points).forEach((e) => {
      vysledky += `<@${e}> - ${points[e]} bodů`;
    });

    channel.send({
      embeds: [
        {
          title: "Finální výsledky",
          description: vysledky,
          footer: {
            text: "Zobrazují se pouze hráči s počtem bodů vyším než nula.",
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
    console.log(m.channelId);
    console.log(m.content);
    if (meanings.includes(m.content)) {
      if (points[m.author.id] === undefined) points[m.author.id] = 1;
      else points[m.author.id] += 1;
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
    poslatKviz(channel, kanji);
  });
}
