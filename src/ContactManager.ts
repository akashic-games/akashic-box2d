import * as box2d from "@flyover/box2d";
import { Box2D, Body } from "./";

export interface BeginContactParameter {
	contact: box2d.b2Contact;
}

export interface EndContactParameter {
	contact: box2d.b2Contact;
}

export interface PreSolveParameter {
	contact: box2d.b2Contact;
	oldManifold: box2d.b2Manifold;
}

export interface PostSolveParameter {
	contact: box2d.b2Contact;
	impulse: box2d.b2ContactImpulse;
}

/**
 * `ContactManager` のインスタンス生成時に指定するパラメータ。
 */
export interface ContactManagerParameter {
	/**
	 * Box2D のインスタンス。
	 */
	box2d: Box2D;
}

/**
 * 衝突判定を管理するクラス。
 */
export class ContactManager implements g.Destroyable {
	/**
	 * Box2D のインスタンス。
	 */
	box2d: Box2D;

	beginContact: g.Trigger<BeginContactParameter> = new g.Trigger();
	endContact: g.Trigger<EndContactParameter> = new g.Trigger();
	preSolve: g.Trigger<PreSolveParameter> = new g.Trigger();
	postSolve: g.Trigger<PostSolveParameter> = new g.Trigger();

	private _beginContactTriggerMap: { [id: string]: g.Trigger<BeginContactParameter>; } = {};
	private _endContactTriggerMap: { [id: string]: g.Trigger<EndContactParameter>; } = {};
	private _preSolveTriggerMap: { [id: string]: g.Trigger<PreSolveParameter>; } = {};
	private _postSolveTriggerMap: { [id: string]: g.Trigger<PostSolveParameter>; } = {};

	/**
	 * `ContactManager` のインスタンスを生成する。
	 * @param param `ContactManager` の生成オプション
	 */
	constructor(param: ContactManagerParameter) {
		this.box2d = param.box2d;

		const contactListener = new box2d.b2ContactListener();
		contactListener.BeginContact = contact => {
			const bodyA = this.box2d.getBodyFromb2Body(contact.GetFixtureA().GetBody());
			if (bodyA == null) {
				return;
			}
			const bodyB = this.box2d.getBodyFromb2Body(contact.GetFixtureB().GetBody());
			if (bodyB == null) {
				return;
			}
			const id1 = `${bodyA.id}-${bodyB.id}`;
			const id2 = `${bodyB.id}-${bodyA.id}`;
			const trigger1 = this._beginContactTriggerMap[id1];
			const trigger2 = this._beginContactTriggerMap[id2];
			if (trigger1 && !trigger1.destroyed()) {
				trigger1.fire();
			} else if (trigger2 && !trigger2.destroyed()) {
				trigger2.fire();
			}
			if (this.beginContact && !this.beginContact.destroyed()) {
				this.beginContact.fire({contact});
			}
		};
		contactListener.EndContact = contact => {
			const bodyA = this.box2d.getBodyFromb2Body(contact.GetFixtureA().GetBody());
			if (bodyA == null) {
				return;
			}
			const bodyB = this.box2d.getBodyFromb2Body(contact.GetFixtureB().GetBody());
			if (bodyB == null) {
				return;
			}
			const id1 = `${bodyA.id}-${bodyB.id}`;
			const id2 = `${bodyB.id}-${bodyA.id}`;
			const trigger1 = this._endContactTriggerMap[id1];
			const trigger2 = this._endContactTriggerMap[id2];
			if (trigger1 && !trigger1.destroyed()) {
				trigger1.fire();
			} else if (trigger2 && !trigger2.destroyed()) {
				trigger2.fire();
			}
			if (this.endContact && !this.endContact.destroyed()) {
				this.endContact.fire({contact});
			}
		};
		contactListener.PreSolve = (contact, oldManifold) => {
			const bodyA = this.box2d.getBodyFromb2Body(contact.GetFixtureA().GetBody());
			if (bodyA == null) {
				return;
			}
			const bodyB = this.box2d.getBodyFromb2Body(contact.GetFixtureB().GetBody());
			if (bodyB == null) {
				return;
			}
			const id1 = `${bodyA.id}-${bodyB.id}`;
			const id2 = `${bodyB.id}-${bodyA.id}`;
			const trigger1 = this._preSolveTriggerMap[id1];
			const trigger2 = this._preSolveTriggerMap[id2];
			if (trigger1 && !trigger1.destroyed()) {
				trigger1.fire({contact, oldManifold});
			} else if (trigger2 && !trigger2.destroyed()) {
				trigger2.fire({contact, oldManifold});
			}
			if (this.preSolve && !this.preSolve.destroyed()) {
				this.preSolve.fire({contact, oldManifold});
			}
		};
		contactListener.PostSolve = (contact, impulse) => {
			const bodyA = this.box2d.getBodyFromb2Body(contact.GetFixtureA().GetBody());
			if (bodyA == null) {
				return;
			}
			const bodyB = this.box2d.getBodyFromb2Body(contact.GetFixtureB().GetBody());
			if (bodyB == null) {
				return;
			}
			const id1 = `${bodyA.id}-${bodyB.id}`;
			const id2 = `${bodyB.id}-${bodyA.id}`;
			const trigger1 = this._postSolveTriggerMap[id1];
			const trigger2 = this._postSolveTriggerMap[id2];
			if (trigger1 && !trigger1.destroyed()) {
				trigger1.fire({contact, impulse});
			} else if (trigger2 && !trigger2.destroyed()) {
				trigger2.fire({contact, impulse});
			}
			if (this.postSolve && !this.postSolve.destroyed()) {
				this.postSolve.fire({contact, impulse});
			}
		};

		this.box2d.world.SetContactListener(contactListener);
	}

	/**
	 * このクラスのインスタンスを破棄する。
	 */
	destroy(): void {
		if (this.destroyed()) {
			return;
		}
		this.box2d.world.SetContactListener(box2d.b2ContactListener.b2_defaultListener);
		this.box2d = undefined!;

		Object.keys(this._beginContactTriggerMap).forEach(k => {
			this._beginContactTriggerMap[k].destroy();
		});
		this._beginContactTriggerMap = undefined!;
		Object.keys(this._endContactTriggerMap).forEach(k => {
			this._endContactTriggerMap[k].destroy();
		});
		Object.keys(this._preSolveTriggerMap).forEach(k => {
			this._preSolveTriggerMap[k].destroy();
		});
		this._preSolveTriggerMap = undefined!;
		Object.keys(this._postSolveTriggerMap).forEach(k => {
			this._postSolveTriggerMap[k].destroy();
		});
		this._postSolveTriggerMap = undefined!;

		this.beginContact.destroy();
		this.beginContact = undefined!;
		this.endContact.destroy();
		this.endContact = undefined!;
		this.preSolve.destroy();
		this.preSolve = undefined!;
		this.postSolve.destroy();
		this.postSolve = undefined!;
	}

	/**
	 * このクラスのインスタンスが破棄済みであるかを返す。
	 */
	destroyed(): boolean {
		return this.box2d === undefined;
	}

	/**
	 * `Body` 同士の接触開始を検出する `g.Trigger` を生成する。
	 * @param bodyA 対象のボディ
	 * @param bodyB 対象のボディ
	 */
	createBeginContactTrigger(bodyA: Body, bodyB: Body): g.Trigger<BeginContactParameter> {
		const id = `${bodyA.id}-${bodyB.id}`;
		const trigger = this._beginContactTriggerMap[id];
		if (trigger) {
			return trigger;
		} else {
			this._beginContactTriggerMap[id] = new g.Trigger();
			return this._beginContactTriggerMap[id];
		}
	}

	/**
	 * `Body` 同士の接触開始を検出する `g.Trigger` を削除する。
	 * @param bodyA 対象のボディ
	 * @param bodyB 対象のボディ
	 */
	removeBeginContactTrigger(bodyA: Body, bodyB: Body): boolean {
		const idA = bodyA.id;
		const idB = bodyB.id;
		const id1 = `${idA}-${idB}`;
		const id2 = `${idB}-${idA}`;

		if (this._beginContactTriggerMap[id1]) {
			const trigger = this._beginContactTriggerMap[id1];
			if (!trigger.destroyed()) {
				trigger.destroy();
			}
			delete this._beginContactTriggerMap[id1];
			return true;
		} else if (this._beginContactTriggerMap[id2]) {
			const trigger = this._beginContactTriggerMap[id2];
			if (!trigger.destroyed()) {
				trigger.destroy();
			}
			delete this._beginContactTriggerMap[id2];
			return true;
		}
		return false;
	}

	/**
	 * `Body` 同士の接触終了を検出する `g.Trigger` を生成する。
	 * @param bodyA 対象のボディ
	 * @param bodyB 対象のボディ
	 */
	createEndContactTrigger(bodyA: Body, bodyB: Body): g.Trigger<EndContactParameter> {
		const id = `${bodyA.id}-${bodyB.id}`;
		const trigger = this._endContactTriggerMap[id];
		if (trigger) {
			return trigger;
		} else {
			this._endContactTriggerMap[id] = new g.Trigger();
			return this._endContactTriggerMap[id];
		}
	}

	/**
	 * `Body` 同士の接触終了を検出する `g.Trigger` を削除する。
	 * @param bodyA 対象のボディ
	 * @param bodyB 対象のボディ
	 */
	removeEndContactTrigger(bodyA: Body, bodyB: Body): boolean {
		const idA = bodyA.id;
		const idB = bodyB.id;
		const id1 = `${idA}-${idB}`;
		const id2 = `${idB}-${idA}`;

		if (this._endContactTriggerMap[id1]) {
			const trigger = this._endContactTriggerMap[id1];
			if (!trigger.destroyed()) {
				trigger.destroy();
			}
			delete this._endContactTriggerMap[id1];
			return true;
		} else if (this._endContactTriggerMap[id2]) {
			const trigger = this._endContactTriggerMap[id2];
			if (!trigger.destroyed()) {
				trigger.destroy();
			}
			delete this._endContactTriggerMap[id2];
			return true;
		}
		return false;
	}

	/**
	 * `Body` 同士の接触が解決される直前に発火する `g.Trigger` を生成する。
	 * @param bodyA 対象のボディ
	 * @param bodyB 対象のボディ
	 */
	createPreSolveTrigger(bodyA: Body, bodyB: Body): g.Trigger<PreSolveParameter> {
		const id = `${bodyA.id}-${bodyB.id}`;
		const trigger = this._preSolveTriggerMap[id];
		if (trigger) {
			return trigger;
		} else {
			this._preSolveTriggerMap[id] = new g.Trigger();
			return this._preSolveTriggerMap[id];
		}
	}

	/**
	 * `Body` 同士の接触が解決される直前に発火する `g.Trigger` を削除する。
	 * @param bodyA 対象のボディ
	 * @param bodyB 対象のボディ
	 */
	removePreSolveTrigger(bodyA: Body, bodyB: Body): boolean {
		const idA = bodyA.id;
		const idB = bodyB.id;
		const id1 = `${idA}-${idB}`;
		const id2 = `${idB}-${idA}`;

		if (this._preSolveTriggerMap[id1]) {
			const trigger = this._preSolveTriggerMap[id1];
			if (!trigger.destroyed()) {
				trigger.destroy();
			}
			delete this._preSolveTriggerMap[id1];
			return true;
		} else if (this._preSolveTriggerMap[id2]) {
			const trigger = this._preSolveTriggerMap[id2];
			if (!trigger.destroyed()) {
				trigger.destroy();
			}
			delete this._preSolveTriggerMap[id2];
			return true;
		}
		return false;
	}

	/**
	 * `Body` 同士の接触が解決された直後に発火する `g.Trigger` を生成する。
	 * @param bodyA 対象のボディ
	 * @param bodyB 対象のボディ
	 */
	createPostSolveTrigger(bodyA: Body, bodyB: Body): g.Trigger<PostSolveParameter> {
		const id = `${bodyA.id}-${bodyB.id}`;
		const trigger = this._postSolveTriggerMap[id];
		if (trigger) {
			return trigger;
		} else {
			this._postSolveTriggerMap[id] = new g.Trigger();
			return this._postSolveTriggerMap[id];
		}
	}

	/**
	 * `Body` 同士の接触が解決された直後に発火する `g.Trigger` を生成する。
	 * @param bodyA 対象のボディ
	 * @param bodyB 対象のボディ
	 */
	removePostSolveTrigger(bodyA: Body, bodyB: Body): boolean {
		const idA = bodyA.id;
		const idB = bodyB.id;
		const id1 = `${idA}-${idB}`;
		const id2 = `${idB}-${idA}`;

		if (this._postSolveTriggerMap[id1]) {
			const trigger = this._postSolveTriggerMap[id1];
			if (!trigger.destroyed()) {
				trigger.destroy();
			}
			delete this._postSolveTriggerMap[id1];
			return true;
		} else if (this._postSolveTriggerMap[id2]) {
			const trigger = this._postSolveTriggerMap[id2];
			if (!trigger.destroyed()) {
				trigger.destroy();
			}
			delete this._postSolveTriggerMap[id2];
			return true;
		}
		return false;
	}
}
