import * as box2dweb from "box2dweb";

/**
 * ボディの定義。
 * 未指定の場合は box2dweb 側の初期値に従う。
 */
export interface Box2DBodyDef {
	/**
	 * BodyType。
	 */
	type?: number;

	/**
	 * ボディのユーザデータ。
	 */
	userData?: string;

	/**
	 * 開始時にボディをアクティブとするかどうか。
	 */
	active?: boolean;

	/**
	 * ボディのスリープを許可するかどうか。
	 */
	allowSleep?: boolean;

	/**
	 * 角速度の減衰率。
	 */
	angularDamping?: number;

	/**
	 * 角速度。
	 */
	angularVelocity?: number;

	/**
	 * ボディの初期状態をアウェイクにするかスリープにするか。
	 */
	awake?: boolean;

	/**
	 * 他のボディとの衝突時に貫通を許可するかどうか。
	 */
	bullet?: boolean;

	/**
	 * 回転を固定させるかどうか。
	 */
	fixedRotation?: boolean;

	/**
	 * 速度の減衰率。
	 */
	linearDamping?: number;

	/**
	 * ボディの初期速度。
	 */
	linearVelocity?: box2dweb.Common.Math.b2Vec2;

	/**
	 * ボディに与える重力のスケール
	 */
	gravityScale?: number;
}

/**
 * ボディのタイプを指定するオプション。
 * 未指定の場合は box2dweb 側の初期値に従う。
 */
export interface Box2DFixtureDef {
	/**
	 * ボディの形状。
	 */
	shape?: box2dweb.Collision.Shapes.b2PolygonShape | box2dweb.Collision.Shapes.b2CircleShape;

	/**
	 * 密度 (kg/m^2)。
	 */
	density?: number;

	/**
	 * 摩擦係数。
	 */
	friction?: number;

	/**
	 * 反発係数。
	 */
	restitution?: number;

	/**
	 * センサーかどうか。
	 */
	isSensor?: boolean;

	/**
	 * ボディのユーザデータを指定する。
	 */
	userData?: any;

	/**
	 * フィルタリングデータ。
	 */
	filter?: {
		/**
		 * カテゴリのビット値。
		 */
		categoryBits: number;
		/**
		 * マスクのビット値。
		 */
		maskBits: number;
		/**
		 * グループインデックス。
		 */
		groupIndex?: number;
	};
}

/**
 * ボディタイプの定義。
 */
export enum BodyType {
	/**
	 * 静的物体。
	 */
	Static = box2dweb.Dynamics.b2Body.b2_staticBody,
	/**
	 * キネマティック物体。
	 */
	Kinematic = box2dweb.Dynamics.b2Body.b2_kinematicBody,
	/**
	 * 動的物体。
	 */
	Dynamic = box2dweb.Dynamics.b2Body.b2_dynamicBody
}

/**
 * ボディとエンティティを紐づけるインタフェース。
 */
export interface EBody {
	/**
	 * ID。
	 */
	id: string;

	/**
	 * Akashicのエンティティ。
	 */
	entity: g.E;

	/**
	 * Box2Dのボディ。
	 */
	b2Body: box2dweb.Dynamics.b2Body;
}
