import * as g from "@akashic/akashic-engine";
import * as box2dweb from "box2dweb";
import type { Box2DParameter } from "../";
import { Box2D, BodyType } from "../";

(globalThis as any).g = g;

describe("Box2D specs", () => {
	let entity1: any;
	let entity2: any;

	const worldOption: Box2DParameter = {
		gravity: [0, 9.8],
		scale: 100
	};

	beforeEach(() => {
		entity1 = {
			x: 0,
			y: 0,
			width: 10,
			height: 10,
			anchorX: 0,
			anchorY: 0,
			scaleX: 1,
			scaleY: 1,
			angle: 0,
			id: 1,
			mcount: 0,
			modified: () => {
				++entity1.mcount;
			},
			destroyed: () => {
				return false;
			}
		};
		entity2 = {
			x: 0,
			y: 100,
			width: 10,
			height: 10,
			angle: 0,
			anchorX: 0,
			anchorY: 0,
			scaleX: 1,
			scaleY: 1,
			id: 2,
			mcount: 0,
			modified: () => {
				++entity2.mcount;
			},
			destroyed: () => {
				return false;
			}
		};
	});

	function createFixtureDef(): box2dweb.Dynamics.b2FixtureDef {
		const b2 = new Box2D(worldOption);
		const fixDef = b2.createFixtureDef({
			density: 1.0, // 密度
			friction: 0.5, // 摩擦係数
			restitution: 0.2, // 反発係数
			shape: b2.createCircleShape(10)
		});
		return fixDef;
	}

	function createBodyDef(): box2dweb.Dynamics.b2BodyDef {
		const b2 = new Box2D(worldOption);
		const bodyDef = b2.createBodyDef({
			type: BodyType.Dynamic
		});
		return bodyDef;
	}

	it("constructor", () => {
		const b2 = new Box2D(worldOption);
		expect(b2.world).toBeDefined();
		expect(b2.bodies).toBeDefined();
		expect(b2.scale).toBe(100);
	});

	it("constructor - missing option", () => {
		const missingWorldOption1 = {
			scale: 100
		};
		const missingWorldOption2 = {
			gravity: [0, 9.8]
		};
		expect(() => new Box2D(missingWorldOption1 as any)).toThrow();
		expect(() => new Box2D(missingWorldOption2 as any)).toThrow();
	});

	it("createBody", () => {
		const fixDef = createFixtureDef();
		const bodyDef = createBodyDef();
		const b2 = new Box2D(worldOption);
		const body1 = b2.createBody(entity1, bodyDef, fixDef);
		const body2 = b2.createBody(entity2, bodyDef, fixDef);

		expect(b2.bodies[0].b2Body).toEqual(body1!.b2Body);
		expect(b2.bodies[1].b2Body).toEqual(body2!.b2Body);
		expect(b2.bodies[0].entity).toEqual(entity1);
		expect(b2.bodies[0].entity.x).toBe(5);
		expect(b2.bodies[0].entity.y).toBe(5);
		expect(b2.bodies[0].entity.anchorX).toBe(.5);
		expect(b2.bodies[0].entity.anchorY).toBe(.5);
		expect(b2.bodies[1].entity).toEqual(entity2);
		expect(b2.bodies[1].entity.x).toBe(5);
		expect(b2.bodies[1].entity.y).toBe(105);
		expect(b2.bodies[1].entity.anchorX).toBe(.5);
		expect(b2.bodies[1].entity.anchorY).toBe(.5);
	});

	it("createBody - missing shape", () => {
		const b2 = new Box2D(worldOption);
		const fixDef = b2.createFixtureDef({} as any);
		const bodyDef = createBodyDef();

		expect(() => {
			b2.createBody(entity1, bodyDef, fixDef);
		}).toThrow();
	});

	it("createBody - create Body from same Entity", () => {
		const fixDef = createFixtureDef();
		const bodyDef = createBodyDef();
		const b2 = new Box2D(worldOption);
		const body1 = b2.createBody(entity1, bodyDef, fixDef);
		const body2 = b2.createBody(entity1, bodyDef, fixDef);

		expect(b2.bodies[0]).toEqual(body1);
		expect(b2.bodies[0]).not.toEqual(body2);
		expect(b2.bodies[1]).toBeUndefined();
	});

	it("removeBody", () => {
		const fixDef = createFixtureDef();
		const bodyDef = createBodyDef();
		const b2 = new Box2D(worldOption);
		const body1 = b2.createBody(entity1, bodyDef, fixDef);
		const body2 = b2.createBody(entity2, bodyDef, fixDef);

		b2.removeBody(body1!);
		expect(b2.bodies[0]).toEqual(body2);
		expect(b2.bodies[1]).toBeUndefined();

		b2.removeBody(body2!);
		expect(b2.bodies[0]).toBeUndefined();

		b2.removeBody(body2!);
		expect(b2.bodies[0]).toBeUndefined();
	});

	it("removeBody and createBody", () => {
		const fixDef = createFixtureDef();
		const bodyDef = createBodyDef();
		const b2 = new Box2D(worldOption);
		let body = b2.createBody(entity1, bodyDef, fixDef);

		b2.removeBody(body!);
		expect(b2.bodies[0]).toBeUndefined();

		body = b2.createBody(entity1, bodyDef, fixDef);
		expect(b2.bodies[0]).toEqual(body);
	});

	it("destroy", () => {
		const fixDef = createFixtureDef();
		const bodyDef = createBodyDef();
		const b2 = new Box2D(worldOption);
		b2.createBody(entity1, bodyDef, fixDef);

		b2.destroy();
		expect(b2.world).toBeUndefined();
		expect(b2.bodies).toBeUndefined();
		expect(b2.destroyed()).toBe(true);
	});

	it("destroyed", () => {
		const b2 = new Box2D(worldOption);
		b2.destroy();
		expect(b2.destroyed()).toBe(true);
	});

	it("step", () => {
		const b2 = new Box2D(worldOption);

		const fixDef = createFixtureDef();
		const bodyDef = createBodyDef();
		b2.createBody(entity1, bodyDef, fixDef);
		b2.createBody(entity2, bodyDef, fixDef);

		// 重力による自然落下を確認
		let y = entity1.y;
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

	it("step - entity destroyed", () => {
		const b2 = new Box2D(worldOption);

		const fixDef = createFixtureDef();
		const bodyDef = createBodyDef();
		const body1 = b2.createBody(entity1, bodyDef, fixDef);
		b2.createBody(entity2, bodyDef, fixDef);

		body1!.entity.destroyed = () => true; // destroyed
		b2.step(0.1);
	});

	it("createFixtureDef - missing params", () => {
		const b2 = new Box2D(worldOption);
		const fixDef = b2.createFixtureDef({} as any);
		expect(fixDef.density).toBe(0);
		expect(fixDef.friction).toBe(0.2);
		expect(fixDef.restitution).toBe(0);
		expect(fixDef.shape).toBeNull();
	});

	it("createBodyDef - missing BodyType", () => {
		const b2 = new Box2D(worldOption);
		const bodyDef = b2.createBodyDef({});
		expect(bodyDef.type).toBe(BodyType.Static);
	});

	it("degree", () => {
		const b2 = new Box2D(worldOption);
		expect(b2.degree(Math.PI)).toBe(180);
	});

	it("radian", () => {
		const b2 = new Box2D(worldOption);
		expect(b2.radian(180)).toBe(Math.PI);
	});

	it("vec2", () => {
		const b2 = new Box2D(worldOption);
		const vec = b2.vec2(1, 1);
		const b2Vec = new box2dweb.Common.Math.b2Vec2(1 / 100, 1 / 100);
		expect(vec).toEqual(b2Vec);
	});
});
