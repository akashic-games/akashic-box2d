import {
	b2IFixtureDef, b2IBodyDef, b2Body, b2CircleShape, b2PolygonShape, b2Vec2, b2IParticleGroupDef
} from "@flyover/box2d";

/**
 * ボディの定義。
 * 未指定の場合は box2d.ts 側の初期値に従う。
 */
export interface Box2DBodyDef extends b2IBodyDef {
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
	linearVelocity?: b2Vec2;

	/**
	 * ボディに与える重力のスケール
	 */
	gravityScale?: number;
}

/**
 * ボディのタイプを指定するオプション。
 * 未指定の場合は box2d.ts 側の初期値に従う。
 */
export interface Box2DFixtureDef extends b2IFixtureDef {
	/**
	 * ボディの形状。
	 */
	shape: b2PolygonShape | b2CircleShape;

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
	userData?: string;

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
 * ParticleSystem の定義を指定するオプション。
 * 未指定の場合は box2d.ts 側の初期値に従う。
 */
export interface Box2dParticleSystemDef {
	radius: number;
	strictContactCheck?: boolean;
	density?: number;
	gravityScale?: number;
	maxCount?: number;
	pressureStrength?: number;
	dampingStrength?: number;
	elasticStrength?: number;
	springStrength?: number;
	viscousStrength?: number;
	surfaceTensionPressureStrength?: number;
	surfaceTensionNormalStrength?: number;
	repulsiveStrength?: number;
	powderStrength?: number;
	ejectionStrength?: number;
	staticPressureStrength?: number;
	staticPressureRelaxation?: number;
	staticPressureIterations?: number;
	destroyByAge?: boolean;
	lifetimeGranularity?: number;

	colorMixingStrength?: undefined; // do not support
}

/**
 * ParticleGroup の定義を指定するオプション。
 * 未指定の場合は box2d.ts 側の初期値に従う。
 */
export interface Box2dParticleGroupDef extends b2IParticleGroupDef {
	color?: undefined; // do not support
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
	b2Body: b2Body;
}
