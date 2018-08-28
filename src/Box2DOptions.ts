import * as b2 from "box2dweb";

/**
 * 物理エンジンの世界生成時に指定するオプション。
 */
export interface Box2DOption {
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
 * ボディタイプの定義。
 */
export interface BodyOption {
	/**
	 * BodyTypeを指定する。
	 * 未指定の場合はStaticとなる。
	 */
	type?: number;
	/**
	 * ボディのユーザデータを指定する。
	 * 未指定の場合は `createBody()` 実行時にエンティティのIDが指定される。
	 */
	userData?: string;
	/**
	 * 開始時にボディをアクティブとするかどうか。
	 * 未指定の場合は true となる。
	 */
	active?: boolean;
	/**
	 * ボディのスリープを許可するかどうか。
	 * 未指定の場合は true となる。
	 */
	allowSleep?: boolean;
	/**
	 * 角速度の減衰率。
	 * 未指定の場合は 0 となる。
	 */
	angularDamping?: number;
	/**
	 * 角速度。
	 * 未指定の場合は 0 となる。
	 */
	angularVelocity?: number;
	/**
	 * ボディの初期状態をアウェイクにするかスリープにするか。
	 * 未指定の場合は true となる。
	 */
	awake?: boolean;
	/**
	 * 他のボディとの衝突時に貫通を許可するかどうか。
	 * 未指定の場合は false となる。
	 */
	bullet?: boolean;
	/**
	 * 回転を固定させるかどうか。
	 * 未指定の場合は false となる。
	 */
	fixedRotation?: boolean;
	/**
	 * 速度の減衰率。
	 * 未指定の場合は 0 となる。
	 */
	linearDamping?: number;
	/**
	 * ボディの初期速度。
	 * 未指定の場合は (0, 0) となる。
	 */
	linearVelocity?: b2.Common.Math.b2Vec2;
	/**
	 * 慣性テンソルのスケール。
	 * 未指定の場合は 1 となる。
	 */
	inertiaScale?: number;
}

/**
 * ボディのタイプを指定するオプション。
 */
export interface FixtureOption {
	/**
	 * 密度 (kg/m^2)。
	 * 未指定の場合はボディの質量が1 (kg) となるように自動計算される。
	 */
	density?: number;
	/**
	 * 摩擦係数。
	 * 初期値は0.2である。
	 */
	friction?: number;
	/**
	 * 反発係数。
	 * 初期値は0である。
	 */
	restitution?: number;
	/**
	 * ボディの形状。
	 * 未指定のまま `Box2D#createBody()` に渡すとことはできない。
	 */
	shape?: b2.Collision.Shapes.b2PolygonShape | b2.Collision.Shapes.b2CircleShape;

	/**
	 * フィルタリングデータ。
	 */
	filter?: {
		/**
		 * カテゴリのビット値。
		 * 初期値は 0x1 である。
		 */
		categoryBits?: number;
		/**
		 * マスクのビット値。
		 * 初期値は 0xFFFF である。
		 */
		maskBits?: number;
		/**
		 * グループインデックス。
		 * 初期値は 0 である。
		 */
		groupIndex?: number;
	};
}

/**
 * ボディとエンティティを紐づけるインタフェース。
 */
export interface EBody {
	/**
	 * Akashicのエンティティ。
	 */
	entity: g.E;
	/**
	 * Box2DWebのボディ。
	 */
	b2body: b2.Dynamics.b2Body;
}
