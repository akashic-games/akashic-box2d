// game.json の globalScripts フィールドにファイル名を列挙しておく必要がある点に注意。
import * as box2d from "@akashic-extension/akashic-box2d";
import { ContactManager, b2ContactSolver } from "@akashic-extension/akashic-box2d";

export interface SandboxSceneParameter {
	flags?: box2d.b2ParticleFlag;
	useSurface?: boolean;
	dampingStrength?: number; // 減衰強度
	lifetime?: number; // ライフ
	useParticles?: boolean;
}

const game = g.game;

export const createSandboxScene = ({flags, useSurface, dampingStrength, lifetime, useParticles}: SandboxSceneParameter) => {
	const scene = new g.Scene({
		game,
		assetIds: ["soccer", "pentagon", "water"]
	});
	scene.loaded.addOnce(() => {
		// 物理エンジン世界の生成
		const b2 = new box2d.Box2D({
			gravity: [0, 9.8],
			scale: 50
		});

		// 地面エンティティの生成
		const floor = new g.FilledRect({
			scene: scene,
			width: game.width,
			height: 50,
			cssColor: "burlywood",
			touchable: true,
			y: game.height - 50
		});
		scene.append(floor);

		// 地面エンティティの性質を定義
		const floorDef = b2.createFixtureDef({
			density: 1.0, // 密度
			friction: 0.5, // 摩擦係数
			restitution: 0.3, // 反発係数
			shape: b2.createRectShape(floor.width, floor.height) // エンティティを四角に設定
		});

		// 地面エンティティを静的物体化
		const staticDef = b2.createBodyDef({
			type: box2d.b2BodyType.b2_staticBody
		});

		// box2dに地面エンティティを追加
		b2.createBody(floor, staticDef, floorDef);

		// 上の壁のエンティティの生成
		const roof = new g.FilledRect({
			scene: scene,
			width: game.width,
			height: 50,
			cssColor: "burlywood",
			touchable: true
		});
		scene.append(roof);

		// エンティティの性質を定義
		const roofDef = b2.createFixtureDef({
			density: 1.0, // 密度
			friction: 0.5, // 摩擦係数
			restitution: 0.3, // 反発係数
			shape: b2.createRectShape(roof.width, roof.height)
		});
		b2.createBody(roof, staticDef, roofDef);

		// 左側の壁のエンティティの生成
		const leftFloor = new g.FilledRect({
			scene: scene,
			cssColor: "burlywood",
			width: 50,
			height: game.height,
			touchable: true
		});
		scene.append(leftFloor);

		// エンティティの性質を定義
		const leftFloorDef = b2.createFixtureDef({
			density: 1.0, // 密度
			friction: 0.5, // 摩擦係数
			restitution: 0.3, // 反発係数
			shape: b2.createRectShape(leftFloor.width, leftFloor.height) // エンティティを四角に設定
		});

		// box2dに壁エンティティを追加
		b2.createBody(leftFloor, staticDef, leftFloorDef);

		// 右側の壁のエンティティの生成
		const rightFloor = new g.FilledRect({
			scene: scene,
			width: 50,
			height: game.height,
			cssColor: "burlywood",
			touchable: true,
			x: game.width - 50
		});
		scene.append(rightFloor);

		// エンティティの性質を定義
		const rightFloorDef = b2.createFixtureDef({
			density: 1.0, // 密度
			friction: 0.5, // 摩擦係数
			restitution: 0.3, // 反発係数
			shape: b2.createRectShape(rightFloor.width, rightFloor.height) // エンティティを四角に設定
		});
		b2.createBody(rightFloor, staticDef, rightFloorDef);

		// rect1エンティティの生成
		const rect1 = new g.FilledRect({
			scene: scene,
			width: 20,
			height: 180,
			cssColor: "pink",
			x: 100,
			y: 100
		});
		scene.append(rect1);

		// rect2エンティティの生成
		const rect2 = new g.FilledRect({
			scene: scene,
			width: 60,
			height: 20,
			cssColor: "pink",
			x: 240,
			y: 160
		});
		scene.append(rect2);

		// サッカーボールエンティティの作成
		const soccer = new g.Sprite({
			scene: scene,
			width: 80,
			height: 80,
			src: scene.assets["soccer"],
			srcWidth: 100,
			srcHeight: 100,
			x: 105,
			y: 70
		});
		scene.append(soccer);

		// 五角形エンティティの作成
		const pentagon = new g.Sprite({
			scene: scene,
			width: 80,
			height: 80,
			src: scene.assets["pentagon"],
			srcWidth: 100,
			srcHeight: 95,
			x: 300,
			y: 120
		});
		scene.append(pentagon);

		// エンティティの共通性質を定義
		const entityBaseDef = {
			density: 1.0, // 密度
			friction: 0.5, // 摩擦係数
			restitution: 0.3 // 反発係数
		};

		// 動的物体化
		const dynamicDef = b2.createBodyDef({
			type: box2d.b2BodyType.b2_dynamicBody
		});

		// rect1エンティティをbox2dに追加
		const rect1Body = b2.createBody(
			rect1,
			dynamicDef,
			b2.createFixtureDef({
				shape: b2.createRectShape(rect1.width, rect1.height), // rect1エンティティを四角に設定
				...entityBaseDef
			})
		);

		// rect2エンティティをbox2dに追加
		const rect2Body = b2.createBody(
			rect2,
			dynamicDef,
			b2.createFixtureDef({
				shape: b2.createRectShape(rect2.width, rect2.height), // rect2エンティティを四角に設定
				...entityBaseDef
			})
		);

		// サッカーボールエンティティをbox2dに追加
		const soccerBody = b2.createBody(
			soccer,
			dynamicDef,
			b2.createFixtureDef({
				shape: b2.createCircleShape(soccer.width), // サッカーボールエンティティを円に設定
				...entityBaseDef
			})
		);

		// 五角形エンティティを設定
		const vertices = [
			b2.vec2(40 - pentagon.width / 2, 0 - pentagon.height / 2),
			b2.vec2(pentagon.width - pentagon.width / 2, 28 - pentagon.height / 2),
			b2.vec2(64 - pentagon.width / 2, pentagon.height - pentagon.height / 2),
			b2.vec2(16 - pentagon.width / 2, pentagon.height - pentagon.height / 2),
			b2.vec2(0 - pentagon.width / 2, 28 - pentagon.height / 2)
		];

		// 五角形エンティティをbox2dに追加
		b2.createBody(
			pentagon,
			dynamicDef,
			b2.createFixtureDef({
				shape: b2.createPolygonShape(vertices), // 五角形エンティティの頂点ポリゴンを設定
				...entityBaseDef
			})
		);

		soccer.touchable = true;
		soccer.pointUp.add(ev => {
			// ボールのドラッグでインパルスを与える
			// ApplyLinearImpulse()はbox2dの機能です。
			soccerBody.b2Body.ApplyLinearImpulse(b2.vec2(ev.startDelta.x * 20, ev.startDelta.y * 20), soccerBody.b2Body.GetWorldCenter());
		});

		scene.update.add(() => {
			// 物理エンジンの世界をすすめる
			b2.step(1 / game.fps);
		});

		// 衝突を管理する ContactManager のインスタンスを生成
		const contactManager = new ContactManager({
			box2d: b2
		});

		let _rect1BodyCSSColor: string = rect1.cssColor;
		let _rect2BodyCSSColor: string = rect2.cssColor;

		// soccerBody と rect1Body の接触が開始された際のトリガーを生成
		contactManager.createBeginContactTrigger(soccerBody, rect1Body).add(() => {
			rect1.cssColor = "red";
			rect1.modified();
		});
		// soccerBody と rect2Body の接触が開始された際のトリガーを生成
		contactManager.createBeginContactTrigger(soccerBody, rect2Body).add(() => {
			rect2.cssColor = "red";
			rect2.modified();
		});

		// soccerBody と rect1Body の接触が終了した際のトリガーを生成
		contactManager.createEndContactTrigger(soccerBody, rect1Body).add(() => {
			rect1.cssColor = _rect1BodyCSSColor;
			rect1.modified();
		});
		// soccerBody と rect1Body の接触が終了した際のトリガーを生成
		contactManager.createEndContactTrigger(soccerBody, rect2Body).add(() => {
			rect2.cssColor = _rect2BodyCSSColor;
			rect2.modified();
		});

		const particleSystemDef = b2.createParticleSystemDef({
			radius: b2.meter(4), // 粒子の半径 (px -> meter)
			dampingStrength
		});
		const particleSystem = b2.createParticleSystem(particleSystemDef);

		let particleE: box2d.ParticleE;
		if (useSurface) {
			particleE = b2.createParticleE({
				scene,
				surface: scene.assets["water"] as g.ImageAsset,
				particleSystem
			});
		} else {
			const rg = game.random.get(50, 150);
			const b = game.random.get(200, 255);
			const cssColor = `rgb(${rg}, ${rg}, ${b})`;
			particleE = b2.createParticleE({
				cssColor, scene, particleSystem
			});
		}

		if (useParticles) {
			scene.pointMoveCapture.add(ev => {
				if (ev.target != null) {
					return;
				}

				const particleDef = b2.createParticleDef({
					position: b2.vec2(ev.point.x + ev.startDelta.x, ev.point.y + ev.startDelta.y),
					lifetime,
					flags
				});
				const index = b2.createParticle(particleSystem, particleDef);
				particleE.addParticle(index);

				scene.append(particleE);
			});
		} else {
			scene.pointDownCapture.add(ev => {
				if (ev.target != null) {
					return;
				}

				const particleGroupDef = b2.createParticleGroupDef({
					position: b2.vec2(ev.point.x, ev.point.y),
					shape: b2.createCircleShape(50),
					lifetime,
					flags
				});
				const particleGroup = b2.createParticleGroup(particleSystem, particleGroupDef);
				particleE.addParticleGroup(particleGroup);

				scene.append(particleE);
			});
		}

		const font = new g.DynamicFont({
			game,
			size: 23,
			fontFamily: g.FontFamily.Serif
		});

		// クリアボタン
		const clear = new g.Label({
			scene,
			text: "クリア",
			font,
			fontSize: 23,
			x: 0,
			y: game.height - 30,
			width: game.width,
			touchable: true
		});
		clear.pointDown.add(() => {
			particleE.removeAllParticles(true);
		});
		scene.append(clear);

		// もどるボタン
		const back = new g.Label({
			scene,
			text: "もどる",
			font,
			fontSize: 23,
			x: 100,
			y: game.height - 30,
			width: game.width,
			touchable: true
		});
		back.pointDown.add(() => {
			game.popScene();
		});
		scene.append(back);
	});
	return scene;
};
