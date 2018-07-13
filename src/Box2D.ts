import * as b2 from "box2dweb";
import {BodyType} from "./BodyType";
import * as options from "./Box2DOptions";

/**
 * AkashicのエンティティをBox2DWebのb2Worldに追加し、演算結果をエンティティに反映するクラス。
 */
export class Box2D implements g.Destroyable {

	/**
	 * b2Worldのインスタンス。
	 */
	world: b2.Dynamics.b2World;

	/**
	 * b2Worldのスケール。
	 */
	scale: number;

	/**
	 * このクラスが保持するEBodyのリスト。
	 */
	bodies: options.EBody[];

	/**
	 * AkashicのエンティティをBox2DWebのb2Worldに追加し、演算結果をエンティティに反映するクラスを生成する。
	 * @param param Worldの生成オプション
	 */
	constructor(param: options.Box2DOption) {
		if (!param.gravity)
			throw new Error("Missing parameter: gravity");
		if (!param.scale)
			throw new Error("Missing parameter: scale");

		var sleep = param.sleep != null ? param.sleep : true;

		this.world = new b2.Dynamics.b2World(new b2.Common.Math.b2Vec2(param.gravity[0], param.gravity[1]), sleep);
		this.bodies = [];
		this.scale = param.scale;
	}

	/**
	 * このクラスにボディを追加し、そのEBodyを返す。
	 * すでに同エンティティが追加されている場合は何もしない。
	 * @param entity 対象のエンティティ
	 * @param bodyDef 対象のb2BodyDef
	 * @param fixtureDef 対象のb2FixtureDef
	 */
	createBody(entity: g.E, bodyDef: b2.Dynamics.b2BodyDef, fixtureDef: b2.Dynamics.b2FixtureDef | b2.Dynamics.b2FixtureDef[]): options.EBody {
		for (let i = 0; i < this.bodies.length; i++) {
			if (this.bodies[i].entity === entity) return;
		}
		const b2Body = this.world.CreateBody(bodyDef);

		if (Array.isArray(fixtureDef)) {
			for (let i = 0; i < fixtureDef.length; i++) {
				b2Body.CreateFixture(fixtureDef[i]);
			}
		} else {
			b2Body.CreateFixture(fixtureDef);
		}

		const userData = bodyDef.userData != null ? bodyDef.userData : entity.id;
		b2Body.SetUserData(userData);
		b2Body.SetPositionAndAngle(this.vec2(entity.x + entity.width / 2, entity.y + entity.height / 2), this.radian(entity.angle));

		const body = {
			entity: entity,
			b2body: b2Body
		};
		this.bodies.push(body);
		return body;
	}

	/**
	 * このクラスに追加されたボディを削除する。
	 * @param body 削除するボディ
	 */
	removeBody(body: options.EBody): void {
		this.world.DestroyBody(body.b2body);
		var index = this.bodies.indexOf(body);
		if (index === -1)
			return;

		this.bodies.splice(index, 1);
	}

	/**
	 * このクラスのインスタンスを破棄する。
	 */
	destroy(): void {
		this.world = undefined;
		this.bodies = undefined;
		this.scale = undefined;
	}

	/**
	 * このクラスのインスタンスが破棄済みであるかを返す。
	 */
	destroyed(): boolean {
		return this.world === undefined;
	}

	/**
	 * Worldの時間を経過させ、このクラスに追加されたエンティティの座標と角度を変更する。
	 * このメソッドは暗黙的に `E#modified()` を呼び出している。
	 * @param dt 経過させる時間単位
	 * @param velocityIteration 速度演算のイテレーション回数 省略時は10
	 * @param positionIteration 位置演算のイテレーション回数 省略時は10
	 */
	step(dt: number, velocityIteration?: number, positionIteration?: number): void {
		velocityIteration = velocityIteration != null ? velocityIteration : 10;
		positionIteration = positionIteration != null ? positionIteration : 10;
		this.world.Step(dt, velocityIteration, positionIteration);

		for (let i = 0; i < this.bodies.length; ++i) {
			const body = this.bodies[i].b2body;
			const entity = this.bodies[i].entity;
			if (entity.destroyed()) continue;
			if (body.IsAwake()) {
				const pos = body.GetPosition();
				entity.x = pos.x * this.scale - entity.width / 2;
				entity.y = pos.y * this.scale - entity.height / 2;
				entity.angle = this.degree(body.GetAngle());
				entity.modified();
			}
		}
	}

	/**
	 * ボディ同士の接触を、Box2DWebのユーザデータを参照して検出する。
	 * @param body1 対象のボディ
	 * @param body2 対象のボディ
	 * @param contact 対象のb2Contacts
	 */
	isContact(body1: options.EBody, body2: options.EBody, contact: b2.Dynamics.Contacts.b2Contact): boolean {
		const bodyA = contact.GetFixtureA().GetBody().GetUserData();
		const bodyB = contact.GetFixtureB().GetBody().GetUserData();
		if ( (body1.b2body.GetUserData() === bodyA && body2.b2body.GetUserData() === bodyB)
			|| (body1.b2body.GetUserData() === bodyB && body2.b2body.GetUserData() === bodyA) ) {
			return true;
		}
		return false;
	}

	/**
	 * 長方形を表すb2PolygonShapeインスタンスを生成する。
	 * Box2DWebのSetAsBoxを利用している。
	 * @param width 横幅 px
	 * @param height 縦幅 px
	 */
	createRectShape(width: number, height: number): b2.Collision.Shapes.b2PolygonShape {
		const shape = new b2.Collision.Shapes.b2PolygonShape;
		shape.SetAsBox(width / (this.scale * 2), height / (this.scale * 2));
		return shape;
	}

	/**
	 * 円を表すb2CircleShapeインスタンスを生成する。
	 * @param diameter 直径 px
	 */
	createCircleShape(diameter: number): b2.Collision.Shapes.b2CircleShape {
		return new b2.Collision.Shapes.b2CircleShape((diameter / 2) / this.scale);
	}

	/**
	 * 任意の多角形を表すb2PolygonShapeインスタンスを生成する。
	 * Box2DWebのSetAsArrayを利用している。
	 * @param vertices[] 頂点のb2Vec2配列
	 */
	createPolygonShape(vertices: b2.Common.Math.b2Vec2[]): b2.Collision.Shapes.b2PolygonShape {
		const shape = new b2.Collision.Shapes.b2PolygonShape;
		shape.SetAsArray(vertices, vertices.length);
		return shape;
	}

	/**
	 * b2FixtureDefインスタンスを生成する。
	 * @param fixtureOption FixtureOption
	 */
	createFixtureDef(fixtureOption: options.FixtureOption) {
		const fixtureDef = new b2.Dynamics.b2FixtureDef;
		fixtureDef.density = fixtureOption.density != null ? fixtureOption.density : 0;
		fixtureDef.friction = fixtureOption.friction != null ? fixtureOption.friction : 0.2;
		fixtureDef.restitution = fixtureOption.restitution != null ? fixtureOption.restitution : 0;
		fixtureDef.shape = fixtureOption.shape;
		return fixtureDef;
	}

	/**
	 * b2BodyDefインスタンスを生成する。
	 * @param bodyOption BodyOption
	 */
	createBodyDef(bodyOption: options.BodyOption) {
		const bodyDef = new b2.Dynamics.b2BodyDef;
		bodyDef.type = bodyOption.type != null ? bodyOption.type : BodyType.Static;
		bodyDef.userData = bodyOption.userData;
		bodyDef.angularDamping = bodyOption.angularDamping != null ? bodyOption.angularDamping : 0;
		bodyDef.angularVelocity = bodyOption.angularVelocity != null ? bodyOption.angularVelocity : 0;
		bodyDef.linearDamping = bodyOption.linearDamping != null ? bodyOption.linearDamping : 0;
		bodyDef.linearVelocity = bodyOption.linearVelocity != null ? bodyOption.linearVelocity : this.vec2(0, 0);
		bodyDef.inertiaScale = bodyOption.inertiaScale != null ? bodyOption.inertiaScale : 1;
		bodyDef.active = bodyOption.active != null ? bodyOption.active : true;
		bodyDef.allowSleep = bodyOption.allowSleep != null ? bodyOption.allowSleep : true;
		bodyDef.awake = bodyOption.awake != null ? bodyOption.awake : true;
		bodyDef.bullet = bodyOption.bullet != null ? bodyOption.bullet : true;
		bodyDef.fixedRotation = bodyOption.fixedRotation != null ? bodyOption.fixedRotation : false;
		return bodyDef;
	}

	/**
	 * ラジアンを度に変換する。
	 * @param 対象のラジアン
	 */
	degree(radian: number): number {
		return radian * 180 / Math.PI;
	}

	/**
	 * 度をラジアンに変換する。
	 * @param 対象の度
	 */
	radian(degree: number): number {
		return degree * Math.PI / 180;
	}

	/**
	 * ビクセルスケールに変換したb2Vec2インスタンスを生成する。
	 * @param x x方向のピクセル値
	 * @param y y方向のピクセル値
	 */
	vec2(x: number, y: number): b2.Common.Math.b2Vec2 {
		return new b2.Common.Math.b2Vec2(x / this.scale, y / this.scale);
	}
}
