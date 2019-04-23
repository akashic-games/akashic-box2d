import * as box2d from "@flyover/box2d";
import { EBody, Box2DFixtureDef, Box2DBodyDef } from "./parateters";

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
	 * このクラスが保持する `EBody` のリスト。
	 */
	bodies: EBody[];

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
			throw g.ExceptionFactory.createAssertionError("Missing parameter: gravity");
		}
		if (param.scale == null) {
			throw g.ExceptionFactory.createAssertionError("Missing parameter: scale");
		}

		const b2world = new box2d.b2World(new box2d.b2Vec2(param.gravity[0], param.gravity[1]));
		this.world = b2world;
		this.bodies = [];
		this.scale = param.scale;
	}

	/**
	 * このクラスにボディを追加し、その `EBody` を返す。
	 * すでに同エンティティが追加されている場合は何もせず `null` を返す。
	 * @param entity 対象のエンティティ
	 * @param bodyDef 対象のb2BodyDef
	 * @param fixtureDef 対象のb2FixtureDefまたは対象のb2FixtureDefの配列
	 */
	createBody(entity: g.E, bodyDef: box2d.b2BodyDef, fixtureDef: box2d.b2FixtureDef | box2d.b2FixtureDef[]): EBody | null {
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
		b2Body.SetAngle(this.radian(entity.angle));

		const body: EBody = {
			id: `${this._createBodyCount++}`,
			entity,
			b2Body
		};
		this.bodies.push(body);
		return body;
	}

	/**
	 * このクラスに追加された `EBody` を削除する。
	 * @param ebody 削除する `EBody`
	 */
	removeBody(ebody: EBody): void {
		const index = this.bodies.indexOf(ebody);
		if (index === -1) {
			return;
		}
		this.world.DestroyBody(ebody.b2Body);
		this.bodies.splice(index, 1);
	}

	/**
	 * エンティティからこのクラスに追加されている `EBody` を返す。
	 * @param entity エンティティ
	 */
	getEBodyFromEntity(entity: g.E): EBody | null {
		for (let i = 0; i < this.bodies.length; i++) {
			if (this.bodies[i].entity === entity) {
				return this.bodies[i];
			}
		}
		return null;
	}

	/**
	 * `b2Body` からこのクラスに追加されている `EBody` を返す。
	 * @param b2Body b2Body
	 */
	getEBodyFromb2Body(b2Body: box2d.b2Body): EBody | null {
		for (let i = 0; i < this.bodies.length; i++) {
			if (this.bodies[i].b2Body === b2Body) {
				return this.bodies[i];
			}
		}
		return null;
	}

	/**
	 * このクラスのインスタンスを破棄する。
	 */
	destroy(): void {
		this.world = undefined!;
		this.bodies = undefined!;
	}

	/**
	 * このクラスのインスタンスが破棄済みであるかを返す。
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
	step(dt: number, velocityIteration?: number, positionIteration?: number): void {
		velocityIteration = velocityIteration || 10;
		positionIteration = positionIteration || 10;
		this.world.Step(dt, velocityIteration, positionIteration);
		this.stepBody();
	}

	/**
	 * ボディ同士の接触を、Box2DWebのユーザデータを参照して検出する。
	 * @param body1 対象のボディ
	 * @param body2 対象のボディ
	 * @param contact 対象のb2Contacts
	 */
	isContact(body1: EBody, body2: EBody, contact: box2d.b2Contact): boolean {
		const bodyA = contact.GetFixtureA().GetBody().GetUserData();
		const bodyB = contact.GetFixtureB().GetBody().GetUserData();
		if ( (body1.b2Body.GetUserData() === bodyA && body2.b2Body.GetUserData() === bodyB)
			|| (body1.b2Body.GetUserData() === bodyB && body2.b2Body.GetUserData() === bodyA) ) {
			return true;
		}
		return false;
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
	 * @param radius 半径 px
	 */
	createCircleShape(radius: number): box2d.b2CircleShape {
		const shape = new box2d.b2CircleShape();
		shape.Set(this.vec2(0, 0), (radius / 2) / this.scale);
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
	 * ラジアンを度に変換する。
	 * @param radian 対象のラジアン
	 */
	degree(radian: number): number {
		return radian * 180 / Math.PI;
	}

	/**
	 * 度をラジアンに変換する。
	 * @param degree 対象の度
	 */
	radian(degree: number): number {
		return degree * Math.PI / 180;
	}

	/**
	 * この物理エンジン世界のビクセルスケールに変換した `b2Vec2` インスタンスを生成する。
	 * @param x x方向のピクセル値
	 * @param y y方向のピクセル値
	 */
	vec2(x: number, y: number): box2d.b2Vec2 {
		return new box2d.b2Vec2(x / this.scale, y / this.scale);
	}

	private stepBody(): void {
		for (let i = 0; i < this.bodies.length; i++) {
			const b2Body = this.bodies[i].b2Body;
			const entity = this.bodies[i].entity;
			if (entity.destroyed()) {
				continue;
			}
			const pos = b2Body.GetPosition();
			entity.x = pos.x * this.scale - entity.width / 2;
			entity.y = pos.y * this.scale - entity.height / 2;
			entity.angle = this.degree(b2Body.GetAngle());
			entity.modified();
		}
	}
}
