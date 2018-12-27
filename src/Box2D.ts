import * as b2 from "box2dweb";
import {BodyType} from "./BodyType";
import * as options from "./Box2DOptions";

/* tslint:disable */
// patch box2dweb
(function(box2d: any) {
	// https://www.ecma-international.org/ecma-262/6.0/#sec-number.epsilon
	var EPSILON = 2.2204460492503130808472633361816e-16;

	var b2Settings = box2d.Common.b2Settings,
		b2Body = box2d.Dynamics.b2Body,
		b2World = box2d.Dynamics.b2World,
		b2Contact = box2d.Dynamics.Contacts.b2Contact;

	// https://github.com/hecht-software/box2dweb/blob/c8aff6e9d295a9d72e1728e76b6d1d5fdcf616f5/Box2D.js#L6282
	b2World.prototype.SolveTOI = function (step: any) {
		var b;
		var fA;
		var fB;
		var bA;
		var bB;
		var cEdge;
		var j;
		var island = this.m_island;
		island.Initialize(this.m_bodyCount, b2Settings.b2_maxTOIContactsPerIsland, b2Settings.b2_maxTOIJointsPerIsland, null, this.m_contactManager.m_contactListener, this.m_contactSolver);
		var queue = b2World.s_queue;
		for (b = this.m_bodyList;
			b; b = b.m_next) {
			b.m_flags &= ~b2Body.e_islandFlag;
			b.m_sweep.t0 = 0.0;
		}
		var c;
		for (c = this.m_contactList;
			c; c = c.m_next) {
			c.m_flags &= ~(b2Contact.e_toiFlag | b2Contact.e_islandFlag);
		}
		for (j = this.m_jointList;
			j; j = j.m_next) {
			j.m_islandFlag = false;
		}
		terminated:
		for (;;) {
			if (this.terminator && this.terminator(this)) {
				break terminated;
			}
			var minContact = null;
			var minTOI = 1.0;
			for (c = this.m_contactList;
				c; c = c.m_next) {
				if (c.IsSensor() == true || c.IsEnabled() == false || c.IsContinuous() == false) {
					continue;
				}
				var toi = 1.0;
				if (c.m_flags & b2Contact.e_toiFlag) {
					toi = c.m_toi;
				}
				else {
					fA = c.m_fixtureA;
					fB = c.m_fixtureB;
					bA = fA.m_body;
					bB = fB.m_body;
					if ((bA.GetType() != b2Body.b2_dynamicBody || bA.IsAwake() == false) && (bB.GetType() != b2Body.b2_dynamicBody || bB.IsAwake() == false)) {
						continue;
					}
					var t0 = bA.m_sweep.t0;
					if (bA.m_sweep.t0 < bB.m_sweep.t0) {
						t0 = bB.m_sweep.t0;
						bA.m_sweep.Advance(t0);
					}
					else if (bB.m_sweep.t0 < bA.m_sweep.t0) {
						t0 = bA.m_sweep.t0;
						bB.m_sweep.Advance(t0);
					}
					toi = c.ComputeTOI(bA.m_sweep, bB.m_sweep);
					b2Settings.b2Assert(0.0 <= toi && toi <= 1.0);
					if (toi > 0.0 && toi < 1.0) {
						toi = (1.0 - toi) * t0 + toi;
						if (toi > 1) toi = 1;
					}
					c.m_toi = toi;
					c.m_flags |= b2Contact.e_toiFlag;
				}
				if (Number.MIN_VALUE < toi && toi < minTOI) {
					minContact = c;
					minTOI = toi;
				}
			}
			// Number.MIN_VALUE ではなく EPSILON を用いる。
			if (minContact == null || 1.0 - 100.0 * EPSILON < minTOI) {
				break;
			}
			fA = minContact.m_fixtureA;
			fB = minContact.m_fixtureB;
			bA = fA.m_body;
			bB = fB.m_body;
			b2World.s_backupA.Set(bA.m_sweep);
			b2World.s_backupB.Set(bB.m_sweep);
			bA.Advance(minTOI);
			bB.Advance(minTOI);
			minContact.Update(this.m_contactManager.m_contactListener);
			minContact.m_flags &= ~b2Contact.e_toiFlag;
			if (minContact.IsSensor() == true || minContact.IsEnabled() == false) {
				bA.m_sweep.Set(b2World.s_backupA);
				bB.m_sweep.Set(b2World.s_backupB);
				bA.SynchronizeTransform();
				bB.SynchronizeTransform();
				continue;
			}
			if (minContact.IsTouching() == false) {
				continue;
			}
			var seed = bA;
			if (seed.GetType() != b2Body.b2_dynamicBody) {
				seed = bB;
			}
			island.Clear();
			var queueStart = 0;
			var queueSize = 0;
			queue[queueStart + queueSize++] = seed;
			seed.m_flags |= b2Body.e_islandFlag;
			while (queueSize > 0) {
				if (this.terminator && this.terminator(this)) {
					break terminated;
				}
				b = queue[queueStart++];
				--queueSize;
				island.AddBody(b);
				if (b.IsAwake() == false) {
					b.SetAwake(true);
				}
				if (b.GetType() != b2Body.b2_dynamicBody) {
					continue;
				}
				for (cEdge = b.m_contactList;
					cEdge; cEdge = cEdge.next) {
					if (island.m_contactCount == island.m_contactCapacity) {
						break;
					}
					if (cEdge.contact.m_flags & b2Contact.e_islandFlag) {
						continue;
					}
					if (cEdge.contact.IsSensor() == true || cEdge.contact.IsEnabled() == false || cEdge.contact.IsTouching() == false) {
						continue;
					}
					island.AddContact(cEdge.contact);
					cEdge.contact.m_flags |= b2Contact.e_islandFlag;
					var other = cEdge.other;
					if (other.m_flags & b2Body.e_islandFlag) {
						continue;
					}
					if (other.GetType() != b2Body.b2_staticBody) {
						other.Advance(minTOI);
						other.SetAwake(true);
					}
					queue[queueStart + queueSize] = other;
					++queueSize;
					other.m_flags |= b2Body.e_islandFlag;
				}
				for (var jEdge = b.m_jointList; jEdge; jEdge = jEdge.next) {
					if (island.m_jointCount == island.m_jointCapacity) continue;
					if (jEdge.joint.m_islandFlag == true) continue;
					other = jEdge.other;
					if (other.IsActive() == false) {
						continue;
					}
					island.AddJoint(jEdge.joint);
					jEdge.joint.m_islandFlag = true;
					if (other.m_flags & b2Body.e_islandFlag) continue;
					if (other.GetType() != b2Body.b2_staticBody) {
						other.Advance(minTOI);
						other.SetAwake(true);
					}
					queue[queueStart + queueSize] = other;
					++queueSize;
					other.m_flags |= b2Body.e_islandFlag;
				}
			}
			var subStep = b2World.s_timestep;
			subStep.warmStarting = false;
			subStep.dt = (1.0 - minTOI) * step.dt;
			subStep.inv_dt = 1.0 / subStep.dt;
			subStep.dtRatio = 0.0;
			subStep.velocityIterations = step.velocityIterations;
			subStep.positionIterations = step.positionIterations;
			island.SolveTOI(subStep);
			var i = 0;
			for (i = 0;
				i < island.m_bodyCount; ++i) {
				b = island.m_bodies[i];
				b.m_flags &= ~b2Body.e_islandFlag;
				if (b.IsAwake() == false) {
					continue;
				}
				if (b.GetType() != b2Body.b2_dynamicBody) {
					continue;
				}
				b.SynchronizeFixtures();
				for (cEdge = b.m_contactList;
					cEdge; cEdge = cEdge.next) {
					cEdge.contact.m_flags &= ~b2Contact.e_toiFlag;
				}
			}
			for (i = 0;
				i < island.m_contactCount; ++i) {
				c = island.m_contacts[i];
				c.m_flags &= ~(b2Contact.e_toiFlag | b2Contact.e_islandFlag);
			}
			for (i = 0;
				i < island.m_jointCount; ++i) {
				j = island.m_joints[i];
				j.m_islandFlag = false;
			}
			this.m_contactManager.FindNewContacts();
		}
	};

	// b2World を継承するコンストラクタ関数
	function ctor() {
		b2World.apply(this, arguments);
		this.terminator = null;
	}
	ctor.prototype = Object.create(b2World.prototype);

	box2d.Dynamics.b2World = ctor;
})(b2);
/* tslint:enable */

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
	 * 物理演算を中断させるコールバック関数を登録する。
	 * コールバック関数が true を返すとき、物理演算を中断する。
	 * @param callback コールバック関数。null または undefined のとき、すでに登録されたコールバック関数があればそれを削除する。
	 */
	setTerminator(callback: (world: b2.Dynamics.b2World) => void): void {
		(this.world as any).terminator = callback;
	}

	/**
	 * このクラスにボディを追加し、そのEBodyを返す。
	 * すでに同エンティティが追加されている場合は何もしない。
	 * @param entity 対象のエンティティ
	 * @param bodyDef 対象のb2BodyDef
	 * @param fixtureDef 対象のb2FixtureDefまたは対象のb2FixtureDefの配列
	 */
	createBody(entity: g.E, bodyDef: b2.Dynamics.b2BodyDef, fixtureDef: b2.Dynamics.b2FixtureDef | b2.Dynamics.b2FixtureDef[]): options.EBody {
		for (let i = 0; i < this.bodies.length; i++) {
			if (this.bodies[i].entity === entity) return;
		}
		const fixtureDefs = Array.isArray(fixtureDef) ? fixtureDef : [fixtureDef];

		for (let i = 0; i < fixtureDefs.length; i++) {
			if (!fixtureDefs[i].shape)
				throw new Error("Missing parameter: shape");
		}

		const b2Body = this.world.CreateBody(bodyDef);

		for (let i = 0; i < fixtureDefs.length; i++) {
			b2Body.CreateFixture(fixtureDefs[i]);
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

		const opt = fixtureOption.filter || {};
		fixtureDef.filter.categoryBits = opt.categoryBits != null ? opt.categoryBits : 0x1;
		fixtureDef.filter.maskBits = opt.maskBits != null ? opt.maskBits : 0xFFFF;
		fixtureDef.filter.groupIndex = opt.groupIndex != null ? opt.groupIndex : 0;
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
