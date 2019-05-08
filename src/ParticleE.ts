import { b2ParticleSystem, b2ParticleGroup } from "@flyover/box2d";

/**
 * ParticleE の生成パラメータ。
 */
export type ParticleEParameter = SurfaceParticleEParameter | FilledRectParticleEParameter;

export interface BaseParticleEParameter {
	scene: g.Scene;
	particleSystem: b2ParticleSystem;
	particleGroup: b2ParticleGroup;
}

export interface SurfaceParticleEParameter extends BaseParticleEParameter {
	surface: g.ImageAsset | g.Surface;
}

export interface FilledRectParticleEParameter extends BaseParticleEParameter {
	cssColor: string;
}

/**
 * Box2d の Particle の描画処理を行う g.E の派生クラス。
 * 本クラスはいかなる子エンティティの追加が禁止されることに注意。
 *
 * 本クラスは暗黙で生成される。ゲーム開発者が直接生成する必要はない。
 */
export class ParticleE extends g.E {
	particleSystem: b2ParticleSystem;
	particleGroup: b2ParticleGroup;

	private surface?: g.Surface;
	private cssColor?: string;
	private worldScale: number;

	constructor(param: ParticleEParameter, worldScale: number) {
		super(param);
		this.particleSystem = param.particleSystem;
		this.particleGroup = param.particleGroup;
		this.worldScale = worldScale;

		if ("surface" in param) {
			if (param.surface instanceof g.ImageAsset) {
				this.surface = param.surface.asSurface();
			} else {
				this.surface = param.surface;
			}
		} else if ("cssColor" in param) {
			this.cssColor = param.cssColor;
		} else {
			throw g.ExceptionFactory.createAssertionError("Invalid argument");
		}
	}

	// override
	append(): never {
		throw g.ExceptionFactory.createAssertionError("Can not append g.E to ParticleE");
	}

	// override
	insertBefore(): never {
		throw g.ExceptionFactory.createAssertionError("Can not insert g.E to ParticleE");
	}

	// override
	destroy(): void {
		super.destroy();
		this.particleGroup.DestroyParticles(false);
		this.particleSystem.DestroyParticleGroup(this.particleGroup);
		this.particleSystem = undefined!;
		this.particleGroup = undefined!;
		this.surface = undefined;
	}

	// override
	renderSelf(renderer: g.Renderer): boolean {
		const scale = this.worldScale;
		const system = this.particleSystem;
		const group = this.particleGroup;
		const positions = system.GetPositionBuffer();
		const index = group.GetBufferIndex();
		const length = group.GetParticleCount();
		const radius = system.GetRadius();

		renderer.save();
		if (this.surface) {
			const surface = this.surface;
			const {width, height} = surface;
			const offsetX = width / 2;
			const offsetY = height / 2;
			for (let i = index; i < index + length; i++) {
				const {x, y} = positions[i];
				renderer.drawImage(surface, 0, 0, width, height, x * scale - offsetX, y * scale - offsetY);
			}
		} else if (this.cssColor) {
			const cssColor = this.cssColor;
			renderer.transform([scale, 0, 0, scale, 0, 0]);
			const offset = radius / 2;
			for (let i = index; i < index + length; i++) {
				const {x, y} = positions[i];
				renderer.fillRect(x - offset, y - offset, radius, radius, cssColor);
			}
		}
		renderer.restore();
		return false;
	}
}
