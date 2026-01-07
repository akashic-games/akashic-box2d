import * as box2dweb from "box2dweb";
import type { EBody, Box2DFixtureDef, Box2DBodyDef } from "./parameters";
import * as patch from "../patch/index";

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
	/**
	 * 停止した物体を物理演算対象とするかどうか。
	 * 省略時はtrue。
	 */
	sleep?: boolean;
}

/**
 * AkashicのエンティティをBox2DWebのb2Worldに追加し、演算結果をエンティティに反映するクラス。
 */
export class Box2D {
	/**
	 * `b2World` のインスタンス。
	 */
	world: box2dweb.Dynamics.b2World;

	/**
	 * このクラスが保持する `EBody` のリスト。
	 */
	bodies: EBody[] = [];

	/**
	 * 物理世界のピクセルサイズとAkashicのピクセルサイズのスケール比。
	 */
	scale: number;

	private _createBodyCount: number = 0;
	// オブジェクト生成を減らすためのキャッシュ
	private _matrix: g.PlainMatrix = new g.PlainMatrix();

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
		const sleep = param.sleep != null ? !!param.sleep : true;
		const b2world = new box2dweb.Dynamics.b2World(new box2dweb.Common.Math.b2Vec2(param.gravity[0], param.gravity[1]), sleep);
		this.scale = param.scale;
		this.world = b2world;

		if (patch.isAvailableGMath()) {
			patch.overrideMathInstance(g.Math);
		}
	}

	/**
	 * このクラスにボディを追加し、その `EBody` を返す。
	 * すでに同エンティティが追加されている場合は何もせず `null` を返す。
	 * エンティティのアンカーポイントが (0.5, 0.5) に指定される点に注意。
	 * @param entity 対象のエンティティ
	 * @param bodyDef 対象のb2BodyDef
	 * @param fixtureDef 対象のb2FixtureDefまたは対象のb2FixtureDefの配列
	 */
	createBody(
		entity: g.E,
		bodyDef: box2dweb.Dynamics.b2BodyDef,
		fixtureDef: box2dweb.Dynamics.b2FixtureDef | box2dweb.Dynamics.b2FixtureDef[]
	): EBody | null {
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

		if (entity.anchorX !== 0.5 || entity.anchorY !== 0.5) {
			const m = this._matrix;
			const e = entity;
			m.update(e.width, e.height, e.scaleX, e.scaleY, e.angle, e.x, e.y, e.anchorX, e.anchorY);
			const {x, y} = m.multiplyPoint({x: e.width / 2, y: e.height / 2});
			e.x = x;
			e.y = y;
			e.anchorX = 0.5;
			e.anchorY = 0.5;
		}

		b2Body.SetPositionAndAngle(
			this.vec2(entity.x, entity.y),
			this.radian(entity.angle)
		);
		b2Body.SetUserData(bodyDef.userData != null ? bodyDef.userData : entity.id);

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
	 * step() 中は削除できない。 (例えば接触判定のコールバック内など)
	 * @param ebody 削除する `EBody`
	 */
	removeBody(ebody: EBody): void {
		const index = this.bodies.indexOf(ebody);
		if (index === -1) {
			return;
		}
		if (this.world.IsLocked()) {
			throw new Error("removeBody(): can't remove a body while the world is locked (step() is running). Please call after step()");
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
	getEBodyFromb2Body(b2Body: box2dweb.Dynamics.b2Body): EBody | null {
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
	step(dt: number, velocityIteration: number = 10, positionIteration: number = 10): void {
		this.world.Step(dt, velocityIteration, positionIteration);
		this.stepBodies();
	}

	/**
	 * 指定した二つのボディの接触であるかどうかを判定する。
	 * ただし、この判定はボディそのものではなく「ボディ生成時に与えた `userData`」が一致するかで行われる。
	 * 詳細は下記の「複数ボディ同士の接触イベント検出」を参照のこと。
	 * https://github.com/akashic-games/akashic-box2d/blob/master/getstarted.md
	 * @param body1 対象のボディ
	 * @param body2 対象のボディ
	 * @param contact 対象のb2Contacts
	 */
	isContact(body1: EBody, body2: EBody, contact: box2dweb.Dynamics.Contacts.b2Contact): boolean {
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
	createRectShape(width: number, height: number): box2dweb.Collision.Shapes.b2PolygonShape {
		const shape = new box2dweb.Collision.Shapes.b2PolygonShape();
		shape.SetAsBox(width / (this.scale * 2), height / (this.scale * 2));
		return shape;
	}

	/**
	 * 円を表す `b2CircleShape` インスタンスを生成する。
	 * @param diameter 直径 px
	 */
	createCircleShape(diameter: number): box2dweb.Collision.Shapes.b2CircleShape {
		return new box2dweb.Collision.Shapes.b2CircleShape((diameter / 2) / this.scale);
	}

	/**
	 * 任意の多角形を表す `b2PolygonShape` インスタンスを生成する。
	 * @param vertices[] 各頂点の `b2Vec2` 配列
	 */
	createPolygonShape(vertices: box2dweb.Common.Math.b2Vec2[]): box2dweb.Collision.Shapes.b2PolygonShape {
		const shape = new box2dweb.Collision.Shapes.b2PolygonShape();
		shape.SetAsArray(vertices, vertices.length);
		return shape;
	}

	/**
	 * b2FixtureDefインスタンスを生成する。
	 * @param fixtureOption FixtureOption
	 */
	createFixtureDef(fixtureDef: Box2DFixtureDef): box2dweb.Dynamics.b2FixtureDef {
		const def = new box2dweb.Dynamics.b2FixtureDef();
		if (fixtureDef.shape != null) {
			def.shape = fixtureDef.shape;
		}
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
	createBodyDef(bodyDef: Box2DBodyDef): box2dweb.Dynamics.b2BodyDef {
		const def = new box2dweb.Dynamics.b2BodyDef();
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
		if (bodyDef.linearVelocity != null) {
			def.linearVelocity = bodyDef.linearVelocity;
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
	vec2(x: number, y: number): box2dweb.Common.Math.b2Vec2 {
		return new box2dweb.Common.Math.b2Vec2(x / this.scale, y / this.scale);
	}

	private stepBodies(): void {
		for (let i = 0; i < this.bodies.length; i++) {
			const b2Body = this.bodies[i].b2Body;
			const entity = this.bodies[i].entity;
			if (entity.destroyed()) {
				continue;
			}
			const pos = b2Body.GetPosition();
			entity.anchorX = 0.5;
			entity.anchorY = 0.5;
			entity.x = pos.x * this.scale;
			entity.y = pos.y * this.scale;
			entity.angle = this.degree(b2Body.GetAngle());
			entity.modified();
		}
	}
}
