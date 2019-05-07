import * as box2d from "@akashic-extension/akashic-box2d";
var game = g.game;

export = () => {
	const scene = new g.Scene({game: game, assetIds: ["soccer", "pentagon"]});
	scene.loaded.add(() => {

		// 物理エンジン世界の生成
		const worldOption = {
			gravity: [0, 9.8],
			scale: 50,
			sleep: true
		};
		const b2 = new box2d.Box2D(worldOption);

		// 地面エンティティの生成
		const floor = new g.FilledRect({
			scene: scene,
			cssColor: "black",
			x: 0,
			y: game.height - 50,
			width: game.width,
			height: 50
		});
		scene.append(floor);

		// 地面エンティティの性質を定義
		const floorDef = b2.createFixtureDef({
			density: 1.0, // 密度
			friction: 0.5, // 摩擦係数
			restitution: 0.3, // 反発係数
			shape: b2.createRectShape(floor.width, floor.height) // 地面エンティティを四角に設定
		});

		// 地面エンティティを静的物体化
		const staticDef = new box2d.b2BodyDef();
		staticDef.type = box2d.b2BodyType.b2_staticBody;

		// Box2Dに地面エンティティを追加
		const floorBody = b2.createBody(floor, staticDef, floorDef);

		// rect1エンティティの生成
		const rect1 = new g.FilledRect({
			scene: scene,
			cssColor: "pink",
			x: 200,
			y: 200,
			width: 20,
			height: 180
		});
		scene.append(rect1);

		// rect2エンティティの生成
		const rect2 = new g.FilledRect({
			scene: scene,
			cssColor: "red",
			x: 240,
			y: 0,
			width: 60,
			height: 20
		});
		scene.append(rect2);

		// サッカーボールエンティティの作成
		const soccer = new g.Sprite({
			scene: scene,
			src: scene.assets["soccer"],
			x: 210,
			y: 30,
			width: 80,
			height: 80,
			srcWidth: 100,
			srcHeight: 98
		});
		scene.append(soccer);

		// 五角形エンティティの作成
		const pentagon = new g.Sprite({
			scene: scene,
			src: scene.assets["pentagon"],
			x: 260,
			y: 0,
			width: 80,
			height: 80,
			srcWidth: 100,
			srcHeight: 95
		});
		scene.append(pentagon);

		// エンティティの共通の性質
		const commonFixtureDef = {
			density: 1.0, // 密度
			friction: 0.5, // 摩擦係数
			restitution: 0.3 // 反発係数
		};

		// 動的物体化
		const dynamicDef = new box2d.b2BodyDef();
		dynamicDef.type = box2d.b2BodyType.b2_dynamicBody;

		// rect1エンティティをBox2Dに追加
		b2.createBody(
			rect1, dynamicDef,
			b2.createFixtureDef({
				shape: b2.createRectShape(rect1.width, rect1.height), // rect1エンティティを四角に設定
				...commonFixtureDef
			})
		);

		// rect2エンティティをBox2Dに追加
		b2.createBody(
			rect2, dynamicDef,
			b2.createFixtureDef({
				shape: b2.createRectShape(rect2.width, rect2.height), // rect2エンティティを四角に設定
				...commonFixtureDef
			})
		);

		// サッカーボールエンティティをBox2Dに追加
		const soccerBody = b2.createBody(
			soccer, dynamicDef,
			b2.createFixtureDef({
				shape: b2.createCircleShape(soccer.width), // サッカーボールエンティティを円に設定
				...commonFixtureDef
			})
		);

		// 五角形エンティティの頂点を設定
		const vertices = [
			b2.vec2(40 - pentagon.width / 2, 0 - pentagon.height / 2),
			b2.vec2(pentagon.width - pentagon.width / 2, 28 - pentagon.height / 2),
			b2.vec2(64 - pentagon.width / 2, pentagon.height - pentagon.height / 2),
			b2.vec2(16 - pentagon.width / 2, pentagon.height - pentagon.height / 2),
			b2.vec2(0 - pentagon.width / 2, 28 - pentagon.height / 2)
		];

		// 五角形エンティティをBox2Dに追加
		b2.createBody(
			pentagon, dynamicDef,
			b2.createFixtureDef({
				shape: b2.createPolygonShape(vertices)
			})
		);

		const contactManager = new box2d.ContactManager({ box2d: b2 });

		// 接触開始時のイベントリスナー
		contactManager.createBeginContactTrigger(soccerBody, floorBody).add(() => {
			// サッカーボールと地面がぶつかったら地面の色を青にする
			floor.cssColor = "blue";
			floor.modified();
		});
		// 接触が離れた時のイベントリスナー
		contactManager.createEndContactTrigger(soccerBody, floorBody).add(() => {
			// サッカーボールと地面が離れたら地面の色を黒にする
			floor.cssColor = "black";
			floor.modified();
		});

		soccer.touchable = true;
		soccer.pointDown.add((o: g.PointDownEvent) => {
			const pos = getEntityPosition(soccer);
			const delta = {
				x: o.point.x - soccer.width / 2,
				y: o.point.y - soccer.height / 2
			};
			// ボールクリックでインパルスを与える
			// ApplyLinearImpulse()は Box2D.ts の機能です。
			soccerBody.b2Body.ApplyLinearImpulse(b2.vec2(delta.x * -20, delta.y * -20), b2.vec2(pos.x, pos.y));
		});

		scene.update.add(() => {
			// 物理エンジンの世界をすすめる
			b2.step(1 / game.fps);
		});

		function getEntityPosition(entity: g.E) {
			return {
				x: entity.x + entity.width / 2,
				y: entity.y + entity.height / 2
			};
		}
	});
	return scene;
};
