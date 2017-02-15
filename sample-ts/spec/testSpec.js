// NOTE: スクリプトアセットとして実行される環境をエミュレーションするためにglobal.gを生成する
global.g = require("@akashic/akashic-engine");

describe("utils", function() {
	beforeEach(function() {
	});

	afterEach(function() {
	});

	it("dummy", function() {
		expect(2 - 1).toBe(1);
	});
});
