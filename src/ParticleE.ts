import { b2ParticleSystem, b2ParticleGroup } from "@flyover/box2d";

/**
 * ParticleE の生成パラメータ。
 */
export type ParticleEParameter = SurfaceParticleEParameter | FilledRectParticleEParameter;

export interface BaseParticleEParameter {
	scene: g.Scene;
	particleSystem: b2ParticleSystem;
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
	particles: number[] = [];
	particleGroups: b2ParticleGroup[] = [];
	onDestroyed: g.Trigger<void> = new g.Trigger();

	private surface?: g.Surface;
	private cssColor?: string;
	private worldScale: number;

	constructor(param: ParticleEParameter, worldScale: number) {
		super(param);
		this.particleSystem = param.particleSystem;
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
			throw g.ExceptionFactory.createAssertionError("ParticleE#constructor: Invalid argument");
		}
	}

	/**
	 * このエンティティに `Particle` を追加する。
	 * @param index 追加する `Particle` の index
	 */
	addParticle(index: number): void {
		for (let i = 0; i < this.particles.length; i++) {
			if (this.particles[i] === null) {
				return;
			}
		}
		this.particles.push(index);
	}

	/**
	 * このエンティティに `b2ParticleGroup` を追加する。
	 * @param particleGroup 追加する`b2ParticleGroup`
	 */
	addParticleGroup(particleGroup: b2ParticleGroup): void {
		for (let i = 0; i < this.particleGroups.length; i++) {
			if (this.particleGroups[i] === null) {
				return;
			}
		}
		this.particleGroups.push(particleGroup);
	}

	/**
	 * このエンティティに追加された `Particle` を削除する。
	 * @param index 削除する `Particle` の index
	 * @param callDestructionListener `DestructionListener` を呼ぶかどうか
	 */
	removeParticle(index: number, callDestructionListener: boolean = false): void {
		const _index = this.particles.indexOf(index);
		if (_index === -1) {
			return;
		}
		this.particleSystem.DestroyParticle(index, callDestructionListener);
		this.particles.splice(_index, 1);
	}

	/**
	 * このエンティティに追加された `b2ParticleGroup` を削除する。
	 * @param particleGroup 削除する `b2ParticleGroup`
	 * @param callDestructionListener `DestructionListener` を呼ぶかどうか 省略時は false
	 */
	removeParticleGroup(particleGroup: b2ParticleGroup, callDestructionListener: boolean = false): void {
		const index = this.particleGroups.indexOf(particleGroup);
		if (index === -1) {
			return;
		}
		particleGroup.DestroyParticles(callDestructionListener);
		this.particleSystem.DestroyParticleGroup(particleGroup);
		this.particleGroups.splice(index, 1);
	}

	/**
	 * このエンティティに追加されたすべての Particle を削除する。
	 * @param callDestructionListener `DestructionListener` を呼ぶかどうか 省略時は false
	 */
	removeAllParticles(callDestructionListener: boolean = false): void {
		for (let i = 0; i < this.particles.length; i++) {
			const particle = this.particles[i];
			this.particleSystem.DestroyParticle(particle, callDestructionListener);
		}
		for (let i = 0; i < this.particleGroups.length; i++) {
			const particleGroup = this.particleGroups[i];
			particleGroup.DestroyParticles(callDestructionListener);
			this.particleSystem.DestroyParticleGroup(particleGroup);
		}
		this.particles = [];
		this.particleGroups = [];
	}

	// override
	append(): never {
		throw g.ExceptionFactory.createAssertionError("ParticleE#append(): Can not append g.E to ParticleE");
	}

	// override
	insertBefore(): never {
		throw g.ExceptionFactory.createAssertionError("ParticleE#insertBefore():Can not insert g.E to ParticleE");
	}

	// override
	destroy(): void {
		if (this.particleSystem == null) {
			return;
		}
		this.onDestroyed.fire();
		for (let i = 0; i < this.particleGroups.length; i++) {
			this.particleGroups[i].DestroyParticles(false);
			this.particleSystem.DestroyParticleGroup(this.particleGroups[i]);
		}
		for (let i = 0; i < this.particles.length; i++) {
			this.particleSystem.DestroyParticle(this.particles[i]);
		}
		this.particleSystem = undefined!;
		this.particleGroups = undefined!;
		this.particles = undefined!;
		this.surface = undefined;
		this.onDestroyed.destroy();
		this.onDestroyed = undefined!;
		super.destroy();
	}

	// override
	renderSelf(renderer: g.Renderer): boolean {
		const scale = this.worldScale;
		const system = this.particleSystem;
		const positions = system.GetPositionBuffer();
		const radius = system.GetRadius();
		const indexes: number[] = [];
		for (let i = 0; i < this.particleGroups.length; i++) {
			const group = this.particleGroups[i];
			const index = group.GetBufferIndex();
			const length = group.GetParticleCount();
			for (let j = index; j < index + length; j++) {
				indexes.push(j);
			}
		}
		for (let i = 0; i < this.particles.length; i++) {
			indexes.push(this.particles[i]);
		}

		renderer.save();
		if (this.surface) {
			const surface = this.surface;
			const {width, height} = surface;
			const offsetX = width / 2;
			const offsetY = height / 2;
			for (let i = 0; i < indexes.length; i++) {
				const {x, y} = positions[indexes[i]];
				renderer.drawImage(surface, 0, 0, width, height, x * scale - offsetX, y * scale - offsetY);
			}
		} else if (this.cssColor) {
			const cssColor = this.cssColor;
			renderer.transform([scale, 0, 0, scale, 0, 0]);
			const offset = radius / 2;
			for (let i = 0; i < indexes.length; i++) {
				const {x, y} = positions[indexes[i]];
				renderer.fillRect(x - offset, y - offset, radius, radius, cssColor);
			}
		}
		renderer.restore();
		return false;
	}
}
