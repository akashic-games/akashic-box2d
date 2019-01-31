import * as b2 from "box2dweb";
import * as Box2D from "../lib";

/**
 * patchBox2D() のオプショナルなパラメータ。
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
export function patchBox2D(box2d: Box2D.Box2D, opts?: PatchBox2DOptions): void;


/**
 * patchBox2DMath() のオプショナルなパラメータ。
 */
export interface PatchBox2DMathOption {
    /**
     * 正弦波テーブルのサイズ。
     * 省略時、 32768。
     */
    tableSize?: number;

    /**
     * 正弦波テーブルに収められる正弦波の区間。
     *
     * 真のとき、 [0, PI * 2] 。
     * 偽のとき、 [0, PI / 2] 。
     * 省略時、 true 。
     *
     * 区間を小さくするとことで精度が向上しますが、テーブルアクセスのコストが増えます。
     */
    wholePeriod?: boolean;
}

/**
 * Box2Dの利用する数学処理にパッチをあてる。
 *
 * 以下の修正・機能追加を行う。
 * - 実行環境ごとの三角関数の計算結果の違いをなくするため、正弦波テーブルを用いる。
 *
 * @param box2d Box2D。
 * @param opts オプション。
 */
export function patchBox2DMath(opts?: PatchBox2DMathOption): void;
