import { b2ParticleFlag } from "@akashic-extension/akashic-box2d";
import { createSandboxScene, SandboxSceneParameter } from "./sandboxScene";
const game = g.game;

export = () => {
	const scene = new g.Scene({
		game: g.game
	});
	scene.loaded.addOnce(() => {
		const font = new g.DynamicFont({
			game,
			size: 30,
			fontFamily: g.FontFamily.Serif
		});

		scene.append(new g.Label({
			scene: scene,
			text: "Akashic Box2Dサンプル",
			font,
			fontSize: 30,
			x: 0,
			y: 0,
			width: game.width,
			textAlign: g.TextAlign.Center,
			widthAutoAdjust: false
		}));

		const labelParameterList: (SandboxSceneParameter & { text: string; })[] = [
			{
				text: "液体（さらさら）",
				flags: b2ParticleFlag.b2_waterParticle,
				dampingStrength: 1.0
			},
			{
				text: "液体（ねばねば）",
				flags: b2ParticleFlag.b2_waterParticle,
				dampingStrength: 0.3
			},
			{
				text: "液体（揮発性）",
				flags: b2ParticleFlag.b2_waterParticle,
				dampingStrength: 0.3,
				lifetime: 10
			},
			{
				text: "液体（画像テクスチャ）",
				flags: b2ParticleFlag.b2_waterParticle,
				useSurface: true
			},
			{
				text: "液体（ドラッグ）",
				flags: b2ParticleFlag.b2_waterParticle,
				dampingStrength: 1.0,
				useParticles: true
			},
			{
				text: "ゴム状",
				flags: b2ParticleFlag.b2_elasticParticle
			},
			{
				text: "パウダー",
				flags: b2ParticleFlag.b2_powderParticle
			},
			{
				text: "バネ状",
				flags: b2ParticleFlag.b2_springParticle
			},
			{
				text: "壁",
				flags: b2ParticleFlag.b2_wallParticle
			}
		];

		labelParameterList.forEach((param, i) => {
			const label = new g.Label({
				scene: scene,
				text: param.text,
				font,
				fontSize: 23,
				x: 0,
				y: 60 + 23 * i,
				width: game.width,
				textAlign: g.TextAlign.Center,
				widthAutoAdjust: false,
				touchable: true
			});
			scene.append(label);
			label.pointDown.add(() => {
				game.pushScene(createSandboxScene(param));
			});
		});
	});

	return scene;
};
