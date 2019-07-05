import { b2Body } from "@flyover/box2d";
import { toDegree } from "./utils";

/**
 * Body の生成パラメータ。
 */
export interface BodyParameter {
	id: string;
	worldScale: number;
	entity: g.E;
	b2Body: b2Body;
}

/**
 * `b2Body` と `g.E` を紐づけるクラス。
 *
 * 本クラスは暗黙で生成される。ゲーム開発者が直接生成する必要はない。
 */
export class Body implements g.Destroyable {
	id: string;
	b2Body: b2Body;
	entity: g.E;
	onDestroyed: g.Trigger<void> = new g.Trigger();

	private worldScale: number;

	constructor(param: BodyParameter) {
		this.id = param.id;
		this.worldScale = param.worldScale;
		this.b2Body = param.b2Body;
		this.entity = param.entity;
	}

	modified(): void {
		const {entity, worldScale} = this;
		if (this.destroyed() || !this.b2Body.IsAwake()) {
			return;
		}
		const {x, y} = this.b2Body.GetPosition();
		entity.x = x * worldScale - entity.width / 2;
		entity.y = y * worldScale - entity.height / 2;
		entity.angle = toDegree(this.b2Body.GetAngle());
		entity.modified();
	}

	destroy(): void {
		if (this.destroyed()) {
			return;
		}
		this.onDestroyed.fire();
		this.b2Body = undefined!;
		this.entity = undefined!;
		this.id = undefined!;
		this.onDestroyed = undefined!;
	}

	destroyed(): boolean {
		return this.id == null;
	}
}
