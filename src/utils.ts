/**
 * ラジアンを度に変換する。
 * @param radian 対象のラジアン
 */
export function toDegree(rad: number): number {
	return rad * 180 / Math.PI;
}

/**
 * 度をラジアンに変換する。
 * @param degree 対象の度
 */
export function toRadian(deg: number): number {
	return deg * Math.PI / 180;
}
