import { Command } from "./interface/command";
import { Ping } from "./commands/ping";
import { Slovnik } from "./commands/slovnik";
import { Kviz } from "./commands/kviz";

export const Commands: Command[] = [Ping, Slovnik, Kviz];
