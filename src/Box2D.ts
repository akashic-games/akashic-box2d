import * as box2d from "@flyover/box2d";
import {
	Box2DFixtureDef, Box2DBodyDef, Box2dParticleSystemDef, Box2dParticleGroupDef, Box2dParticleDef
} from "./parateters";
import { toRadian } from "./utils";
import { ParticleE, ParticleEParameter } from "./ParticleE";
import { Body } from "./Body";

/**
 * `Box2D` のインスタンス生成時に指定するパラメータ。
 */
export interface Box2DParameter {
	/**
	 * 重力の方向 (m/s^2)。
	 */
	gravity: number[];
	/**
	 * スケール (pixel/m)。
	 */
	scale: number;
}

/**
 * AkashicのエンティティをBox2D.tsの `b2World` に追加し、演算結果をエンティティに反映するクラス。
 */
export class Box2D implements g.Destroyable {
	/**
	 * `b2World` のインスタンス。
	 */
	world: box2d.b2World;

	/**
	 * このクラスが保持する `Body` のリスト。
	 */
	bodies: Body[] = [];

	/**
	 * このクラスが保持する `ParticleE` のリスト。
	 */
	particles: ParticleE[] = [];

	/**
	 * 物理世界のピクセルサイズとAkashicのピクセルサイズのスケール比。
	 */
	scale: number;

	private _createBodyCount: number = 0;

	/**
	 * `Box2D` のインスタンスを生成する。
	 * @param param `b2World` の生成オプション
	 */
	constructor(param: Box2DParameter) {
		if (param.gravity == null) {
			throw g.ExceptionFactory.createAssertionError("Box2D#constructor: Missing parameter: gravity");
		}
		if (param.scale == null) {
			throw g.ExceptionFactory.createAssertionError("Box2D#constructor: Missing parameter: scale");
		}

		const b2world = new box2d.b2World(new box2d.b2Vec2(param.gravity[0], param.gravity[1]));
		this.world = b2world;
		this.scale = param.scale;
	}

	/**
	 * このクラスにボディを追加し、その `Body` を返す。
	 * すでに同エンティティが追加されている場合は何もせず `null` を返す。
	 * @param entity 対象のエンティティ
	 * @param bodyDef 対象のb2BodyDef
	 * @param fixtureDef 対象のb2FixtureDefまたは対象のb2FixtureDefの配列
	 */
	createBody(entity: g.E, bodyDef: box2d.b2BodyDef, fixtureDef: box2d.b2FixtureDef | box2d.b2FixtureDef[]): Body | null {
		for (let i = 0; i < this.bodies.length; i++) {
			if (this.bodies[i].entity === entity) {
				return null;
			}
		}

		const fixtureDefs = Array.isArray(fixtureDef) ? fixtureDef : [fixtureDef];
		const b2Body = this.world.CreateBody(bodyDef);

		for (let i = 0; i < fixtureDefs.length; i++) {
			b2Body.CreateFixture(fixtureDefs[i]);
		}
		b2Body.SetPosition(this.vec2(entity.x + entity.width / 2, entity.y + entity.height / 2));
		b2Body.SetAngle(toRadian(entity.angle));

		const body = new Body({
			id: `${this._createBodyCount++}`,
			entity,
			b2Body,
			worldScale: this.scale
		});
		body.onDestroyed.addOnce(() => {
			this.world.DestroyBody(body.b2Body);
		});

		this.bodies.push(body);
		return body;
	}

	/**
	 * `b2Particles` インスタンスを生成する。
	 * @param particleSystem b2ParticleSystem
	 * @param partcleDef b2PartcleDef
	 */
	createParticle(particleSystem: box2d.b2ParticleSystem, particleDef: box2d.b2ParticleDef): number {
		const index = particleSystem.CreateParticle(particleDef);
		return index;
	}

	/**
	 * `b2ParticleDef` インスタンスを生成する。
	 * @param particleDef Box2dParticleDef
	 */
	createParticleDef(particleDef?: Box2dParticleDef): box2d.b2ParticleDef {
		const def = new box2d.b2ParticleDef();
		if (particleDef == null) {
			return def;
		}
		if (particleDef.position != null) {
			def.position.Copy(particleDef.position);
		}
		if (particleDef.flags != null) {
			def.flags = particleDef.flags;
		}
		if (particleDef.group != null) {
			def.group = particleDef.group;
		}
		if (particleDef.lifetime != null) {
			def.lifetime = particleDef.lifetime;
		}
		if (particleDef.userData != null) {
			def.userData = particleDef.userData;
		}
		if (particleDef.velocity != null) {
			def.velocity.Copy(particleDef.velocity);
		}
		return def;
	}

	/**
	 * `b2ParticleGroup` インスタンスを生成する。
	 * @param particleSystem b2ParticleSystem
	 * @param particleGroupDef b2ParticleGroupDef
	 */
	createParticleGroup(particleSystem: box2d.b2ParticleSystem, particleGroupDef: box2d.b2ParticleGroupDef): box2d.b2ParticleGroup {
		const particleGroup = particleSystem.CreateParticleGroup(particleGroupDef);
		return particleGroup;
	}

	/**
	 * `b2ParticleGroupDef` インスタンスを生成する。
	 * @param particleGroupDef Box2dParticleGroupDef
	 */
	createParticleGroupDef(particleGroupDef?: Box2dParticleGroupDef): box2d.b2ParticleGroupDef {
		const def = new box2d.b2ParticleGroupDef();
		if (particleGroupDef == null) {
			return def;
		}
		if (particleGroupDef.angularVelocity != null) {
			def.angularVelocity = particleGroupDef.angularVelocity;
		}
		if (particleGroupDef.flags != null) {
			def.flags = particleGroupDef.flags;
		}
		if (particleGroupDef.group != null) {
			def.group = particleGroupDef.group;
		}
		if (particleGroupDef.groupFlags != null) {
			def.groupFlags = particleGroupDef.groupFlags;
		}
		if (particleGroupDef.lifetime != null) {
			def.lifetime = particleGroupDef.lifetime;
		}
		if (particleGroupDef.particleCount != null) {
			def.particleCount = particleGroupDef.particleCount;
		}
		if (particleGroupDef.shape != null) {
			def.shape = particleGroupDef.shape;
		}
		if (particleGroupDef.shapeCount != null) {
			def.shapeCount = particleGroupDef.shapeCount;
		}
		if (particleGroupDef.shapes != null) {
			def.shapes = particleGroupDef.shapes;
		}
		if (particleGroupDef.strength != null) {
			def.strength = particleGroupDef.strength;
		}
		if (particleGroupDef.stride != null) {
			def.stride = particleGroupDef.stride;
		}
		if (particleGroupDef.userData != null) {
			def.userData = particleGroupDef.userData;
		}
		if (particleGroupDef.angle != null) {
			def.angle = particleGroupDef.angle;
		}
		if (particleGroupDef.positionData != null) {
			def.positionData = particleGroupDef.positionData;
		}
		if (particleGroupDef.linearVelocity != null) {
			def.linearVelocity.Copy(particleGroupDef.linearVelocity);
		}
		if (particleGroupDef.position != null) {
			def.position.Copy(particleGroupDef.position);
		}
		return def;
	}

	/**
	 * `b2ParticleSystem` インスタンスを生成する。
	 * @param particleDef b2ParticleSystemDef
	 */
	createParticleSystem(particleDef: box2d.b2ParticleSystemDef): box2d.b2ParticleSystem {
		const particleSystem = this.world.CreateParticleSystem(particleDef);
		return particleSystem;
	}

	/**
	 * `b2ParticleSystemDef` インスタンスを生成する。
	 * @param particleSystemDef Box2dParticleSystemDef
	 */
	createParticleSystemDef(particleSystemDef: Box2dParticleSystemDef): box2d.b2ParticleSystemDef {
		const def = new box2d.b2ParticleSystemDef();
		def.radius = particleSystemDef.radius;
		if (particleSystemDef.dampingStrength != null) {
			def.dampingStrength = particleSystemDef.dampingStrength;
		}
		if (particleSystemDef.density != null) {
			def.density = particleSystemDef.density;
		}
		if (particleSystemDef.destroyByAge != null) {
			def.destroyByAge = particleSystemDef.destroyByAge;
		}
		if (particleSystemDef.ejectionStrength != null) {
			def.ejectionStrength = particleSystemDef.ejectionStrength;
		}
		if (particleSystemDef.elasticStrength != null) {
			def.elasticStrength = particleSystemDef.elasticStrength;
		}
		if (particleSystemDef.gravityScale != null) {
			def.gravityScale = particleSystemDef.gravityScale;
		}
		if (particleSystemDef.lifetimeGranularity != null) {
			def.lifetimeGranularity = particleSystemDef.lifetimeGranularity;
		}
		if (particleSystemDef.maxCount != null) {
			def.maxCount = particleSystemDef.maxCount;
		}
		if (particleSystemDef.powderStrength != null) {
			def.powderStrength = particleSystemDef.powderStrength;
		}
		if (particleSystemDef.pressureStrength != null) {
			def.pressureStrength = particleSystemDef.pressureStrength;
		}
		if (particleSystemDef.repulsiveStrength != null) {
			def.repulsiveStrength = particleSystemDef.repulsiveStrength;
		}
		if (particleSystemDef.springStrength != null) {
			def.springStrength = particleSystemDef.springStrength;
		}
		if (particleSystemDef.staticPressureIterations != null) {
			def.staticPressureIterations = particleSystemDef.staticPressureIterations;
		}
		if (particleSystemDef.staticPressureRelaxation != null) {
			def.staticPressureRelaxation = particleSystemDef.staticPressureRelaxation;
		}
		if (particleSystemDef.staticPressureStrength != null) {
			def.staticPressureStrength = particleSystemDef.staticPressureStrength;
		}
		if (particleSystemDef.strictContactCheck != null) {
			def.strictContactCheck = particleSystemDef.strictContactCheck;
		}
		if (particleSystemDef.surfaceTensionNormalStrength != null) {
			def.surfaceTensionNormalStrength = particleSystemDef.surfaceTensionNormalStrength;
		}
		if (particleSystemDef.surfaceTensionPressureStrength != null) {
			def.surfaceTensionPressureStrength = particleSystemDef.surfaceTensionPressureStrength;
		}
		if (particleSystemDef.viscousStrength != null) {
			def.viscousStrength = particleSystemDef.viscousStrength;
		}
		return def;
	}

	/**
	 * このクラスにボディを追加し、その `ParticleE` を返す。
	 * @param param `particleE` の生成パラメータ
	 * @param destroyParticle `ParticleE#destroy()` が呼ばれた際に `b2ParticleSystem` を削除するかどうか 省略時は false
	 */
	createParticleE(param: ParticleEParameter, destroyParticle: boolean = true): ParticleE {
		const particleE = new ParticleE(param, this.scale);
		if (destroyParticle) {
			particleE.onDestroyed.addOnce(() => this.world.DestroyParticleSystem(param.particleSystem));
		}
		this.particles.push(particleE);
		return particleE;
	}

	/**
	 * このクラスに追加された `Body` を削除する。
	 * @param body 削除する `Body`
	 */
	destroyBody(body: Body): void {
		const index = this.bodies.indexOf(body);
		if (index === -1) {
			return;
		}
		body.destroy();
		this.bodies.splice(index, 1);
	}

	/**
	 * このクラスに追加されたすべての `Body` を削除する。
	 */
	destroyAllBodies(): void {
		for (let i = 0; i < this.bodies.length; i++) {
			this.bodies[i].destroy();
		}
		this.bodies = [];
	}

	/**
	 * このクラスに追加された `ParticleE` を削除する。
	 * @param particleE 削除する `particleE`
	 * @param destroyParticleSystem 対象の `particleE` が所属する `b2ParticleSystem` を破棄するかどうか 省略時は false
	 */
	destroyParticleE(particleE: ParticleE, destroyParticleSystem: boolean = false): void {
		const index = this.particles.indexOf(particleE);
		if (index === -1) {
			return;
		}
		if (destroyParticleSystem) {
			const system = particleE.particleSystem;
			this.world.DestroyParticleSystem(system);
		}
		this.particles.splice(index, 1);
	}

	/**
	 * このクラスに追加されたすべての `ParticleE` を削除する。
	 * @param destroyParticleSystem 対象の `particleE` が所属する `b2ParticleSystem` を破棄するかどうか 省略時は false
	 */
	destroyAllParticleE(destroyParticleSystem: boolean = false): void {
		for (let i = 0; i < this.particles.length; i++) {
			const particle = this.particles[i];
			if (destroyParticleSystem) {
				const system = particle.particleSystem;
				this.world.DestroyParticleSystem(system);
			}
		}
		this.particles = [];
	}

	/**
	 * エンティティからこのクラスに追加されている `Body` を返す。
	 * @param entity エンティティ
	 */
	getBodyFromEntity(entity: g.E): Body | null {
		for (let i = 0; i < this.bodies.length; i++) {
			if (this.bodies[i].entity === entity) {
				return this.bodies[i];
			}
		}
		return null;
	}

	/**
	 * `b2Body` からこのクラスに追加されている `Body` を返す。
	 * @param b2Body b2Body
	 */
	getBodyFromb2Body(b2Body: box2d.b2Body): Body | null {
		for (let i = 0; i < this.bodies.length; i++) {
			if (this.bodies[i].b2Body === b2Body) {
				return this.bodies[i];
			}
		}
		return null;
	}

	/**
	 * インスタンスを破棄する。
	 * 本インスタンスを経由せず直接 `b2World#CreateBody()` 等を利用した場合、それらは破棄されないことに注意。
	 */
	destroy(): void {
		if (this.destroyed()) {
			return;
		}
		this.destroyAllBodies();
		this.destroyAllParticleE(true);
		this.world = undefined!;
		this.bodies = undefined!;
		this.particles = undefined!;
	}

	/**
	 * インスタンスが破棄済みであるかを返す。
	 */
	destroyed(): boolean {
		return this.world === undefined;
	}

	/**
	 * 時間を経過させ、このクラスに追加されたエンティティの座標と角度を変更する。
	 * このメソッドは暗黙的に `E#modified()` を呼び出している。
	 * @param dt 経過させる時間単位
	 * @param velocityIteration 速度演算のイテレーション回数 省略時は10
	 * @param positionIteration 位置演算のイテレーション回数 省略時は10
	 */
	step(dt: number, velocityIteration: number = 10, positionIteration: number = 10): void {
		this.world.Step(dt, velocityIteration, positionIteration);
		this.stepBody();
	}

	/**
	 * 長方形を表す `b2PolygonShape` インスタンスを生成する。
	 * @param width 横幅 px
	 * @param height 縦幅 px
	 */
	createRectShape(width: number, height: number): box2d.b2PolygonShape {
		const shape = new box2d.b2PolygonShape();
		shape.SetAsBox(width / (this.scale * 2), height / (this.scale * 2));
		return shape;
	}

	/**
	 * 円を表す `b2CircleShape` インスタンスを生成する。
	 * @param diameter 直径 px
	 */
	createCircleShape(diameter: number): box2d.b2CircleShape {
		const shape = new box2d.b2CircleShape((diameter / 2) / this.scale);
		return shape;
	}

	/**
	 * 任意の多角形を表す `b2PolygonShape` インスタンスを生成する。
	 * @param vertices[] 各頂点の `b2Vec2` 配列
	 */
	createPolygonShape(vertices: box2d.b2Vec2[]): box2d.b2PolygonShape {
		const shape = new box2d.b2PolygonShape();
		shape.SetAsArray(vertices);
		return shape;
	}

	/**
	 * `b2FixtureDef` インスタンスを生成する。
	 * @param fixtureDef Box2DFixtureDef
	 */
	createFixtureDef(fixtureDef: Box2DFixtureDef): box2d.b2FixtureDef {
		const def = new box2d.b2FixtureDef();
		def.shape = fixtureDef.shape;
		if (fixtureDef.density != null) {
			def.density = fixtureDef.density;
		}
		if (fixtureDef.friction != null) {
			def.friction = fixtureDef.friction;
		}
		if (fixtureDef.restitution != null) {
			def.restitution = fixtureDef.restitution;
		}
		if (fixtureDef.isSensor != null) {
			def.isSensor = fixtureDef.isSensor;
		}
		if (fixtureDef.userData != null) {
			def.userData = fixtureDef.userData;
		}
		const opt = fixtureDef.filter;
		if (opt) {
			def.filter.categoryBits = opt.categoryBits;
			def.filter.maskBits = opt.maskBits;
			if (opt.groupIndex != null) {
				def.filter.groupIndex = opt.groupIndex;
			}
		}
		return def;
	}

	/**
	 * `b2BodyDef` インスタンスを生成する。
	 * @param bodyDef Box2DBodyDef
	 */
	createBodyDef(bodyDef: Box2DBodyDef): box2d.b2BodyDef {
		const def = new box2d.b2BodyDef();
		if (bodyDef.type != null) {
			def.type = bodyDef.type;
		}
		if (bodyDef.angularDamping != null) {
			def.angularDamping = bodyDef.angularDamping;
		}
		if (bodyDef.angularVelocity != null) {
			def.angularVelocity = bodyDef.angularVelocity;
		}
		if (bodyDef.linearDamping != null) {
			def.linearDamping = bodyDef.linearDamping;
		}
		if (bodyDef.linearDamping != null) {
			def.linearDamping = bodyDef.linearDamping;
		}
		if (bodyDef.active != null) {
			def.active = bodyDef.active;
		}
		if (bodyDef.allowSleep != null) {
			def.allowSleep = bodyDef.allowSleep;
		}
		if (bodyDef.awake != null) {
			def.awake = bodyDef.awake;
		}
		if (bodyDef.bullet != null) {
			def.bullet = bodyDef.bullet;
		}
		if (bodyDef.fixedRotation != null) {
			def.fixedRotation = bodyDef.fixedRotation;
		}
		if (bodyDef.userData != null) {
			def.userData = bodyDef.userData;
		}
		return def;
	}

	/**
	 * この物理エンジン世界のビクセルスケールに変換した `b2Vec2` インスタンスを生成する。
	 * @param x x方向のピクセル値
	 * @param y y方向のピクセル値
	 */
	vec2(x: number, y: number): box2d.b2Vec2 {
		return new box2d.b2Vec2(x / this.scale, y / this.scale);
	}

	/**
	 * メートルをピクセルに変換する。
	 * @param meter メートル
	 */
	pixel(meter: number): number {
		return meter * this.scale;
	}

	/**
	 * ピクセルをメートルに変換する。
	 * @param meter メートル
	 */
	meter(pixel: number): number {
		return pixel / this.scale;
	}

	private stepBody(): void {
		for (let i = 0; i < this.bodies.length; i++) {
			this.bodies[i].modified();
		}
		for (let i = 0; i < this.particles.length; i++) {
			this.particles[i].modified();
		}
	}
}
