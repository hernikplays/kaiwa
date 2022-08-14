# Jak přispívat
Vítej a děkuji, že chceš přispět do mého skromného projektu. Zde najdeš všechno, co bys o přispívání měl vědět.

Přispívání má více forem, takže si zvol, co ti vyhovuje nejvíc.

## Issues
Pokud se necítíš na psaní kódu, můžeš v programu hledat a nahlašovat chyby na [Issues](https://github.com/hernikplays/kaiwa/issues).
Najdeš tam předpřipravenou předlohu, ve které je snad vše, co bych po tobě mohl potřebovat.

Pokud máš nějaký nápad, který by se mohl zde vyjímat, určitě ho skrz Issues navrhni. Pokusím se ho implementovat.

## Kód
Pokud se cítíš jako machr a chceš přispět do kódu, tady máš nějaká základní pravidla stylu, která bys měl dodržovat.

1. Před merge vždy použij `npm run lint`
Zkrášluje kód a vyhazuje chyby (varování většinou ignoruju :P).
2. Pro zprávy při commitování používám [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), nebude-li dodrženo, automaticky uzavírám PR
3. Dodržuj složkovou strukturu (viz níže)
4. Při přidávání balíků zkontroluj bezpečnost a licenci balíků
Většina open-source balíků jde publikovat pod GPL-3.0, nicméně je důležité dbát na požadavky jednotlivých licencí.

### Složková struktura
- src - obsahuje zdrojový kód; soubory co se nevlezou do jednotlivých složek tu většinou najdou své místo
- commands - obsahuje veškeré robotové příkazy
- interface - obsahuje TypeScript interfacy
- listeners - obsahují Discord.js listenery

Pokud si myslíš, že je nutné vytvořit novou složku, klidně do toho. V případě nouze to dořeším v pull requestu

### Jak udělat Pull Request
1. Forkněte projekt (tlačítko nahoře)
2. Vytvořte větev s funkcí (`git checkout -b feature/AmazingFeature`)
3. Commitněte změny (`git commit -m 'Add some AmazingFeature'`)
4. Pushněte (`git push origin feature/AmazingFeature`)
5. Otevřte Pull Request na GitHubu