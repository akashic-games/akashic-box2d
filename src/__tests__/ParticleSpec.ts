import * as box2d from "@flyover/box2d";
import { Box2D, Box2DParameter } from "..";

describe("Particle specs", () => {
	const worldOption: Box2DParameter = {
		gravity: [0, 9.8],
		scale: 100
	};

	it("createParticleSystem", () => {
		const b2 = new Box2D(worldOption);
		const particleSystemDef = b2.createParticleSystemDef({
			springStrength: 10,
			radius: 10
		});
		expect(particleSystemDef instanceof box2d.b2ParticleSystemDef).toBe(true);
		expect(particleSystemDef.springStrength).toBe(10);
		expect(particleSystemDef.radius).toBe(10);

		const particleSystem = b2.createParticleSystem(particleSystemDef);
		expect(particleSystem instanceof box2d.b2ParticleSystem).toBe(true);
	});

	it("createParticleGroup", () => {
		const b2 = new Box2D(worldOption);
		const particleGroupDef = b2.createParticleGroupDef({
			userData: "hoge",
			angle: 0.1
		});
		expect(particleGroupDef instanceof box2d.b2ParticleGroupDef).toBe(true);
		expect(particleGroupDef.userData).toBe("hoge");
		expect(particleGroupDef.angle).toBe(0.1);

		const particleSystemDef = b2.createParticleSystemDef({radius: 10});
		const particleSystem = b2.createParticleSystem(particleSystemDef);

		const particleGroup = b2.createParticleGroup(particleSystem, particleGroupDef);
		expect(particleGroup instanceof box2d.b2ParticleGroup).toBe(true);
	});

	xit("createParticleE", () => {
		// TODO
	});

	xit("can create and remove ParticleE", () => {
		// TODO
	});
});
