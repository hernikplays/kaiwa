import { Command } from "./interface/command";
import { Ping } from "./commands/ping";
import { Slovnik } from "./commands/slovnik";

export const Commands: Command[] = [Ping, Slovnik];
