import * as g from "@akashic/akashic-engine";

declare global {
	namespace NodeJS {
		interface Global {
			g: any;
		}
	}
}
global.g = g;
