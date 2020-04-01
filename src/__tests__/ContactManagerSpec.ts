import * as g from "@akashic/akashic-engine";
import { Box2D, BodyType, ContactManager } from "../";

declare global {
	namespace NodeJS {
		interface Global {
			g: typeof g;
		}
	}
}
global.g = g;

describe("ContactManager specs", () => {
	it("constructor", () => {
		const b2 = new Box2D({ gravity: [0, 1], scale: 1 });
		const contactManager = new ContactManager({ box2d: b2 });
		expect(contactManager.box2d).toBe(b2);
		expect(contactManager.destroyed()).toBe(false);

		contactManager.destroy();
		expect(contactManager.destroyed()).toBe(true);
	});

	it("create triggers", () => {
		const b2 = new Box2D({ gravity: [0, 1], scale: 1 });
		const contactManager = new ContactManager({ box2d: b2 });
		const bodyDef1 = b2.createBodyDef({
			type: BodyType.Dynamic
		});
		const fixtureDef1 = b2.createFixtureDef({
			shape: b2.createCircleShape(10)
		});
		const entity1 = {} as any;
		const entity2 = {} as any;
		const body1 = b2.createBody(entity1, bodyDef1, fixtureDef1)!;
		const body2 = b2.createBody(entity2, bodyDef1, fixtureDef1)!;

		const begin = contactManager.createBeginContactTrigger(body1, body2);
		expect((contactManager as any)._beginContactTriggerMap).toEqual({
			"0-1": begin
		});
		contactManager.removeBeginContactTrigger(body1, body2);
		expect((contactManager as any)._beginContactTriggerMap).toEqual({});

		const end = contactManager.createEndContactTrigger(body1, body2);
		expect((contactManager as any)._endContactTriggerMap).toEqual({
			"0-1": end
		});
		contactManager.removeEndContactTrigger(body1, body2);
		expect((contactManager as any)._endContactTriggerMap).toEqual({});
	});

	it("contact spec", done => {
		const b2 = new Box2D({ gravity: [0, 1], scale: 1 });
		const contactManager = new ContactManager({ box2d: b2 });

		const entity1 = {
			destroyed: () => true
		} as any;
		const bodyDef1 = b2.createBodyDef({
			type: BodyType.Dynamic
		});
		const fixtureDef1 = b2.createFixtureDef({
			shape: b2.createCircleShape(10)
		});
		const body1 = b2.createBody(entity1, bodyDef1, fixtureDef1);

		const entity2 = {
			x: 0,
			y: 200,
			destroyed: () => true
		} as any;
		const bodyDef2 = b2.createBodyDef({
			type: BodyType.Dynamic
		});
		const fixtureDef2 = b2.createFixtureDef({
			shape: b2.createRectShape(200, 10)
		});
		const body2 = b2.createBody(entity2, bodyDef2, fixtureDef2);

		contactManager.createBeginContactTrigger(body1!, body2!).addOnce(() => {
			done();
		});

		for (let i = 0; i < 100; ++i) b2.step(1 / 30);
	});
});
