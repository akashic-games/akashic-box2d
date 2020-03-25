import * as box2dweb from "box2dweb";
import { Box2D, EBody } from "./";

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

	private _beginContactTriggerMap: { [id: string]: g.Trigger<void>; } = {};
	private _endContactTriggerMap: { [id: string]: g.Trigger<void>; } = {};

	/**
	 * `ContactManager` のインスタンスを生成する。
	 * @param param `ContactManager` の生成オプション
	 */
	constructor(param: ContactManagerParameter) {
		this.box2d = param.box2d;

		const contactListener = new box2dweb.Dynamics.b2ContactListener();
		contactListener.BeginContact = contact => {
			const bodyA = this.box2d.getEBodyFromb2Body(contact.GetFixtureA().GetBody());
			if (bodyA == null) {
				return;
			}
			const bodyB = this.box2d.getEBodyFromb2Body(contact.GetFixtureB().GetBody());
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
		};
		contactListener.EndContact = contact => {
			const bodyA = this.box2d.getEBodyFromb2Body(contact.GetFixtureA().GetBody());
			if (bodyA == null) {
				return;
			}
			const bodyB = this.box2d.getEBodyFromb2Body(contact.GetFixtureB().GetBody());
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
		};
		this.box2d.world.SetContactListener(contactListener);
	}

	/**
	 * このクラスのインスタンスを破棄する。
	 */
	destroy(): void {
		this.box2d = undefined!;
		Object.keys(this._beginContactTriggerMap).forEach(k => {
			this._beginContactTriggerMap[k].destroy();
		});
		this._beginContactTriggerMap = undefined!;
		Object.keys(this._endContactTriggerMap).forEach(k => {
			this._endContactTriggerMap[k].destroy();
		});
		this._beginContactTriggerMap = undefined!;
	}

	/**
	 * このクラスのインスタンスが破棄済みであるかを返す。
	 */
	destroyed(): boolean {
		return this.box2d === undefined;
	}

	/**
	 * `EBody` 同士の接触開始を検出する `g.Trigger` を生成する。
	 * @param bodyA 対象のボディ
	 * @param bodyB 対象のボディ
	 */
	createBeginContactTrigger(bodyA: EBody, bodyB: EBody): g.Trigger<void> {
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
	 * `EBody` 同士の接触開始を検出する `g.Trigger` を削除する。
	 * @param bodyA 対象のボディ
	 * @param bodyB 対象のボディ
	 */
	removeBeginContactTrigger(bodyA: EBody, bodyB: EBody): boolean {
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
	 * `EBody` 同士の接触終了を検出する `g.Trigger` を生成する。
	 * @param bodyA 対象のボディ
	 * @param bodyB 対象のボディ
	 */
	createEndContactTrigger(bodyA: EBody, bodyB: EBody): g.Trigger<void> {
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
	 * `EBody` 同士の接触終了を検出する `g.Trigger` を削除する。
	 * @param bodyA 対象のボディ
	 * @param bodyB 対象のボディ
	 */
	removeEndContactTrigger(bodyA: EBody, bodyB: EBody): boolean {
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
}
