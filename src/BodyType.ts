import * as b2 from "box2dweb";

/**
 * ボディタイプの定義。
 */
export enum BodyType {
	/**
	 * 静的物体。
	 */
	Static = b2.Dynamics.b2Body.b2_staticBody,
	/**
	 * キネマティック物体。
	 */
	Kinematic = b2.Dynamics.b2Body.b2_kinematicBody,
	/**
	 * 動的物体。
	 */
	Dynamic = b2.Dynamics.b2Body.b2_dynamicBody
}
