import { toDegree, toRadian } from "../utils";

describe("utils specs", () => {
	it("toDegree", () => {
		expect(toDegree(Math.PI)).toBe(180);
	});

	it("toRadian", () => {
		expect(toRadian(180)).toBe(Math.PI);
	});
});
