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

	it("createParticle", () => {
		const b2 = new Box2D(worldOption);
		const particleDef = b2.createParticleDef({
			userData: "hoge",
			lifetime: 100
		});
		expect(particleDef instanceof box2d.b2ParticleDef).toBe(true);
		expect(particleDef.userData).toBe("hoge");
		expect(particleDef.lifetime).toBe(100);

		const particleSystemDef = b2.createParticleSystemDef({radius: 10});
		const particleSystem = b2.createParticleSystem(particleSystemDef);

		const particle = b2.createParticle(particleSystem, particleDef);
		expect(typeof particle).toBe("number");
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

	it("can create and remove ParticleE", () => {
		const b2 = new Box2D(worldOption);
		const particleSystemDef = b2.createParticleSystemDef({radius: 10});
		const particleSystem = b2.createParticleSystem(particleSystemDef);
		const particleE = b2.createParticleE({
			scene: {
				register: () => {
					//
				}
			} as any,
			cssColor: "black",
			particleSystem
		});

		const particleDef = b2.createParticleDef({
			userData: "hoge",
			lifetime: 100
		});
		const particle1 = b2.createParticle(particleSystem, particleDef);
		const particle2 = b2.createParticle(particleSystem, particleDef);

		particleE.addParticle(particle1);
		particleE.addParticle(particle2);
		expect(particleE.particles.length).toBe(2);
		expect(particleE.particles[0]).toBe(particle1);
		expect(particleE.particles[1]).toBe(particle2);

		const particleGroupDef = b2.createParticleGroupDef({
			userData: "hoge",
			angle: 0.1
		});
		const particleGroup1 = b2.createParticleGroup(particleSystem, particleGroupDef);
		const particleGroup2 = b2.createParticleGroup(particleSystem, particleGroupDef);
		const particleGroup3 = b2.createParticleGroup(particleSystem, particleGroupDef);

		particleE.addParticleGroup(particleGroup1);
		particleE.addParticleGroup(particleGroup2);
		particleE.addParticleGroup(particleGroup3);
		expect(particleE.particleGroups.length).toBe(3);
		expect(particleE.particleGroups[0]).toBe(particleGroup1);
		expect(particleE.particleGroups[1]).toBe(particleGroup2);
		expect(particleE.particleGroups[2]).toBe(particleGroup3);

		particleE.removeParticle(particle2);
		expect(particleE.particles.length).toBe(1);
		expect(particleE.particles[0]).toBe(particle1);

		particleE.removeParticleGroup(particleGroup2);
		expect(particleE.particleGroups.length).toBe(2);
		expect(particleE.particleGroups[0]).toBe(particleGroup1);
		expect(particleE.particleGroups[1]).toBe(particleGroup3);

		particleE.removeAllParticles();
		expect(particleE.particles.length).toBe(0);
		expect(particleE.particleGroups.length).toBe(0);
	});
});
