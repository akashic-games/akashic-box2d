import * as b2 from "box2dweb";
import * as Box2D from "../lib";

/**
 * パッチのオプショナルなパラメータ。
 */
export interface PatchBox2DOptions {
    /**
     * 最小TOI算出ループの繰り返し回数の上限。
     * 指定しないとき、Number.MAX_SAFE_INTEGER。
     */
    maxTOILoop?: number;
}

/**
 * Box2Dにパッチをあてる。
 *
 * 以下の修正・機能追加を行う。
 * - 無限ループに陥る不具合の修正。
 * - 物理計算の時間を制限するため、最小TOI算出ループの繰り返し回数の上限を設定する機能の追加。
 *
 * @param box2d Box2D。
 * @param opts オプション。
 */
export function patchBox2D(box2d: Box2D.Box2D, opts?: PatchBox2DOptions);
