var b2 = require("../lib/index.js");
var Box2D = require("../lib/Box2D.js").Box2D;
var BodyType = require("../lib/BodyType.js").BodyType;
var Box2DWeb = require("box2dweb");

describe("test World", function() {
	var entity1;
	var entity2;

	var worldOption = {
		gravity: [0, 9.8],
		scale: 100,
		sleep: true
	};

	beforeEach(function() {
		entity1 = {
			x: 0,
			y: 0,
			width: 10,
			height: 10,
			angle: 0,
			id: 1,
			mcount: 0,
			modified: function() {
				++this.mcount;
			},
			destroyed: function (){
				return false;
			}
		};
		entity2 = {
			x: 0,
			y: 100,
			width: 10,
			height: 10,
			angle: 0,
			id: 2,
			mcount: 0,
			modified: function() {
				++this.mcount;
			},
			destroyed: function (){
				return false;
			}
		};
	});

	afterEach(function() {
	});

	function createFixtureDef(){
		var b2 = new Box2D(worldOption);
		var fixDef = b2.createFixtureDef({
			density: 1.0, // 密度
			friction: 0.5, // 摩擦係数
			restitution: 0.2, // 反発係数
			shape: b2.createCircleShape(10)
		});
		return fixDef;
	}

	function createBodyDef(){
		var b2 = new Box2D(worldOption);
		var bodyDef = b2.createBodyDef({
			type: BodyType.Dynamic
		});
		return bodyDef;
	}

	it("constructor", function() {
		var b2 = new Box2D(worldOption);
		expect(b2.world).toBeDefined();
		expect(b2.bodies).toBeDefined();
		expect(b2.scale).toBe(100);
	});

	it("constructor - no sleep", function() {
		worldOption.sleep = false;
		var b2 = new Box2D(worldOption);
		expect(b2.world).toBeDefined();
		expect(b2.bodies).toBeDefined();
		expect(b2.scale).toBe(100);
	});

	it("constructor - missing option", function() {
		var missingWorldOption1 = {
			scale: 100
		};
		var missingWorldOption2 = {
			gravity: [0, 9.8]
		};
		expect(function() {
			new Box2D(missingWorldOption1);
		}).toThrow();
		expect(function() {
			new Box2D(missingWorldOption2);
		}).toThrow();
	});

	it("createBody", function() {
		var fixDef = createFixtureDef();
		var bodyDef = createBodyDef();
		var b2 = new Box2D(worldOption);
		var body1 = b2.createBody(entity1, bodyDef, fixDef);
		var body2 = b2.createBody(entity2, bodyDef, fixDef);

		expect(b2.bodies[0].b2body).toEqual(body1.b2body);
		expect(b2.bodies[1].b2body).toEqual(body2.b2body);
		expect(b2.bodies[0].entity).toEqual(entity1);
		expect(b2.bodies[1].entity).toEqual(entity2);
	});

	it("createBody - missing shape", function() {
		var b2 = new Box2D(worldOption);
		var fixDef = b2.createFixtureDef({});
		var bodyDef = createBodyDef();

		expect(function(){
			b2.createBody(entity1, bodyDef, fixDef);
		}).toThrow();
	});

	it("createBody - create Body from same Entity", function() {
		var fixDef = createFixtureDef();
		var bodyDef = createBodyDef();
		var b2 = new Box2D(worldOption);
		var body1 = b2.createBody(entity1, bodyDef, fixDef);
		var body2 = b2.createBody(entity1, bodyDef, fixDef);

		expect(b2.bodies[0]).toEqual(body1);
		expect(b2.bodies[1]).toBeUndefined();
	});

	it("createBodyDef - not given userData", function() {
		var fixDef = createFixtureDef();
		var bodyDef = createBodyDef();
		var b2 = new Box2D(worldOption);
		var body = b2.createBody(entity1, bodyDef, fixDef);

		expect(body.b2body.GetUserData()).toBe(entity1.id);
	});

	it("createBodyDef - given userData", function() {
		var fixDef = createFixtureDef();
		var bodyDef = createBodyDef();
		bodyDef.userData = "hoge";
		var b2 = new Box2D(worldOption);
		var body = b2.createBody(entity1, bodyDef, fixDef);

		expect(body.b2body.GetUserData()).toBe("hoge");
	});

	it("removeBody", function() {
		var fixDef = createFixtureDef();
		var bodyDef = createBodyDef();
		var b2 = new Box2D(worldOption);
		var body1 = b2.createBody(entity1, bodyDef, fixDef);
		var body2 = b2.createBody(entity2, bodyDef, fixDef);

		b2.removeBody(body1);
		expect(b2.bodies[0]).toEqual(body2);
		expect(b2.bodies[1]).toBeUndefined();

		b2.removeBody(body2);
		expect(b2.bodies[0]).toBeUndefined();

		b2.removeBody(body2);
		expect(b2.bodies[0]).toBeUndefined();
	});

	it("removeBody and createBody", function() {
		var fixDef = createFixtureDef();
		var bodyDef = createBodyDef();
		var b2 = new Box2D(worldOption);
		var body = b2.createBody(entity1, bodyDef, fixDef);

		b2.removeBody(body);
		expect(b2.bodies[0]).toBeUndefined();

		body = b2.createBody(entity1, bodyDef, fixDef);
		expect(b2.bodies[0]).toEqual(body);
	});

	it("destroy", function() {
		var fixDef = createFixtureDef();
		var bodyDef = createBodyDef();
		var b2 = new Box2D(worldOption);
		var body = b2.createBody(entity1, bodyDef, fixDef);

		b2.destroy();
		expect(b2.world).toBeUndefined();
		expect(b2.bodies).toBeUndefined();
		expect(b2.scale).toBeUndefined();
	});

	it("destroyed", function() {
		var b2 = new Box2D(worldOption);
		b2.destroy();
		expect(b2.destroyed()).toBe(true);
	});

	it("isContact - true", function(done) {
		var b2 = new Box2D(worldOption);

		var fixDef = createFixtureDef();
		var bodyDef = createBodyDef();
		var body1 = b2.createBody(entity1, bodyDef, fixDef);

		// body2は四角の静的にして自然落下するbody1とぶつける
		fixDef.shape = b2.createRectShape(entity1.width, entity1.height);
		bodyDef.type = BodyType.Static;
		var body2 = b2.createBody(entity2, bodyDef, fixDef);

		var contactListener = new Box2DWeb.Dynamics.b2ContactListener;
		contactListener.BeginContact = function (contact) {
			if (b2.isContact(body1, body2, contact)) done();
		}

		// ぶつかったらDone！
		b2.world.SetContactListener(contactListener);

		for (var i = 0; i < 100; ++i) b2.step(1/30);
	});

	it("isContact - false", function(done) {
		var b2 = new Box2D(worldOption);

		var fixDef = createFixtureDef();
		var bodyDef = createBodyDef();
		var body1 = b2.createBody(entity1, bodyDef, fixDef);
		entity1.y = 50;
		var body2 = b2.createBody(entity2, bodyDef, fixDef);

		var entity3 = {
			x: 0,
			y: 200,
			width: 10,
			height: 10,
			id: 2,
			mcount: 0,
			modified: function() {
				++this.mcount;
			}
		};

		// body3は四角の静的にして自然落下するbody1、body2とぶつける
		fixDef.shape = b2.createRectShape(entity3.width, entity3.height);
		bodyDef.type = BodyType.Static;
		var body3 = b2.createBody(entity3, bodyDef, fixDef);

		var contactListener = new Box2DWeb.Dynamics.b2ContactListener;
		contactListener.BeginContact = function (contact) {
			// body1.y = 0、body2.y = 50なのでbody1とbody3は最初に絶対ぶつからないはず
			if (!b2.isContact(body1, body3, contact)) done();
		}

		b2.world.SetContactListener(contactListener);

		for (var i = 0; i < 100; ++i) b2.step(1/30);
	});

	it("step", function() {
		var b2 = new Box2D(worldOption);

		var fixDef = createFixtureDef();
		var bodyDef = createBodyDef();
		var body1 = b2.createBody(entity1, bodyDef, fixDef);
		var body2 = b2.createBody(entity2, bodyDef, fixDef);

		// 重力による自然落下を確認
		var y = entity1.y;
		b2.step(0.1);
		expect(entity1.y).toBeGreaterThan(y);
		expect(entity1.mcount).toBe(1);
		y = entity1.y;
		b2.step(0.1);
		expect(entity1.y).toBeGreaterThan(y);
		expect(entity1.mcount).toBe(2);
		y = entity1.y;
		b2.step(0.1);
		expect(entity1.y).toBeGreaterThan(y);
		expect(entity1.mcount).toBe(3);
		y = entity1.y;
		b2.step(0.1);
		expect(entity1.y).toBeGreaterThan(y);
		expect(entity1.mcount).toBe(4);
	});

	it("step - entity destroyed", function() {
		var b2 = new Box2D(worldOption);

		var fixDef = createFixtureDef();
		var bodyDef = createBodyDef();
		var body1 = b2.createBody(entity1, bodyDef, fixDef);
		var body2 = b2.createBody(entity2, bodyDef, fixDef);

		body1.entity.destroyed = function (){ return true; }; // destroyed
		b2.step(0.1);
	});

	it("createFixtureDef - missing params", function() {
		var b2 = new Box2D(worldOption);
		var fixDef = b2.createFixtureDef({});
		expect(fixDef.density).toBe(0);
		expect(fixDef.friction).toBe(0.2);
		expect(fixDef.restitution).toBe(0);
		expect(fixDef.shape).toBeUndefined();
	});

	it("createBodyDef - missing BodyType", function() {
		var b2 = new Box2D(worldOption);
		var bodyDef = b2.createBodyDef({});
		expect(bodyDef.type).toBe(BodyType.Static);
	});

	it("degree", function() {
		var b2 = new Box2D(worldOption);
		expect(b2.degree(Math.PI)).toBe(180);
	});

	it("radian", function() {
		var b2 = new Box2D(worldOption);
		expect(b2.radian(180)).toBe(Math.PI);
	});

	it("vec2", function() {
		var b2 = new Box2D(worldOption);
		var vec = b2.vec2(1, 1);
		var b2Vec = new Box2DWeb.Common.Math.b2Vec2(1 / 100, 1 / 100);
		expect(vec).toEqual(b2Vec);
	});
});
