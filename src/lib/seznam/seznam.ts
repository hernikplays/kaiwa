import axios from "axios";
import * as cheerio from "cheerio";
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

export enum Jazyk {
  // eslint-disable-next-line no-unused-vars
  Anglictina = "anglicky_cesky",
}

export interface Vysledky {
  vyslovnost: string;
  vyznamy: string[];
}

export interface Vyznam {
  cesky: string;
  detaily: string[];
}

export class Seznam {
  jazyk: Jazyk;
  constructor(jazyk: Jazyk) {
    this.jazyk = jazyk;
  }

  /**
   * Slouží k vyhledání na slovnik.seznam.cz
   */
  public async vyhledat(slovo: string): Promise<Vysledky | undefined> {
    const r = await axios.get(
      `https://slovnik.seznam.cz/preklad/${this.jazyk}/${slovo}`
    );
    if (
      r.status > 399 ||
      r.status < 200 ||
      r.data.includes("Nechtěli jste hledat")
    )
      return undefined;

    const vyslovnostRegex =
      /(?<=<span class="TranslatePage-word--pronunciation">).+?<\/span>.+?(?=<\/span>)/gm;
    const vyznamRegex = /(?<=<li>).+?(?=<\/li>)/gm;
    const vyslovnost = vyslovnostRegex.exec(r.data)?.[0] ?? "N/A";

    let m;
    const vyznamy: string[] = [];

    while ((m = vyznamRegex.exec(r.data)) !== null) {
      // Projde všechny zachycené významy
      if (m.index === vyznamRegex.lastIndex) {
        vyznamRegex.lastIndex++;
      }

      m.forEach((match) => {
        const vyznam = /(?<=<a .+?>).+?(?=<\/a>)/gm.exec(match);
        const detailRegex =
          /<span class="Box-content-line">(?!<a).+?<\/span>.+?<\/span>/gm;
        const doplneni = /(?<=<span class='d'>).+?(?=<\/span>)/gm.exec(match);
        let plny = "";
        if (vyznam === null || vyznam.length === 0) return;
        plny = vyznam[0];

        if (doplneni !== null && doplneni.length > 0)
          plny += ` (${doplneni[0]})`; // přidat doplnění významu pokud existuje

        let n;
        while ((n = detailRegex.exec(match)) !== null) {
          // pro každý význam zpracujeme detaily
          if (n.index === detailRegex.lastIndex) {
            detailRegex.lastIndex++;
          }

          n.forEach((d) => {
            d = d.replaceAll('<span lang="cs" class="note">', "<span> - ");
            plny += `\n*- ${cheerio.load(d).text()}*`;
          });
        }

        vyznamy.push(plny);
      });
    }

    return { vyslovnost: cheerio.load(vyslovnost).text(), vyznamy };
  }
}
