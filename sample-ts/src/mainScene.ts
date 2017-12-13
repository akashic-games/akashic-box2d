import * as Box2D from "@akashic-extension/akashic-box2d";
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
		const b2 = new Box2D.Box2D(worldOption);

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
		const staticDef = b2.createBodyDef({
			type: Box2D.BodyType.Static
		});

		// Box2Dに地面エンティティを追加
		const floorBody = b2.createBody(floor, staticDef, floorDef);

		// rect1エンティティの生成
		const rect1 = new g.FilledRect({
			scene: scene,
			cssColor: "pink",
			x: 100,
			y: 100,
			width: 10,
			height: 90
		});
		scene.append(rect1);

		// rect2エンティティの生成
		const rect2 = new g.FilledRect({
			scene: scene,
			cssColor: "red",
			x: 120,
			y: 0,
			width: 30,
			height: 10
		});
		scene.append(rect2);

		// サッカーボールエンティティの作成
		const soccer = new g.Sprite({
			scene: scene,
			src: scene.assets["soccer"],
			x: 105,
			y: 30,
			width: 40,
			height: 40,
			srcWidth: 100,
			srcHeight: 98
		});
		scene.append(soccer);

		// 五角形エンティティの作成
		const pentagon = new g.Sprite({
			scene: scene,
			src: scene.assets["pentagon"],
			x: 150,
			y: 0,
			width: 40,
			height: 40,
			srcWidth: 100,
			srcHeight: 95
		});
		scene.append(pentagon);

		// エンティティの性質を定義
		const entityDef = b2.createFixtureDef({
			density: 1.0, // 密度
			friction: 0.5, // 摩擦係数
			restitution: 0.3 // 反発係数
		});

		// 動的物体化
		const dynamicDef = b2.createBodyDef({
			type: Box2D.BodyType.Dynamic
		});

		// rect1エンティティを四角に設定
		entityDef.shape = b2.createRectShape(rect1.width, rect1.height);
		// rect1エンティティをBox2Dに追加
		b2.createBody(rect1, dynamicDef, entityDef);

		// rect2エンティティを四角に設定
		entityDef.shape = b2.createRectShape(rect2.width, rect2.height);
		// rect2エンティティをBox2Dに追加
		b2.createBody(rect2, dynamicDef, entityDef);

		// サッカーボールエンティティを円に設定
		entityDef.shape = b2.createCircleShape(soccer.width);
		// サッカーボールエンティティをBox2Dに追加
		const soccerBody = b2.createBody(soccer, dynamicDef, entityDef);

		// 五角形エンティティを設定
		const vertices = [
			b2.vec2(20 - pentagon.width / 2, 0 - pentagon.height / 2),
			b2.vec2(pentagon.width - pentagon.width / 2, 14 - pentagon.height / 2),
			b2.vec2(32 - pentagon.width / 2, pentagon.height - pentagon.height / 2),
			b2.vec2(8 - pentagon.width / 2, pentagon.height - pentagon.height / 2),
			b2.vec2(0 - pentagon.width / 2, 14 - pentagon.height / 2)
		];
		entityDef.shape = b2.createPolygonShape(vertices);

		// 五角形エンティティをBox2Dに追加
		b2.createBody(pentagon, dynamicDef, entityDef);

		// 接触イベントのリスナーを生成
		const contactListener = new Box2D.Box2DWeb.Dynamics.b2ContactListener;
		// 接触開始時のイベントリスナー
		contactListener.BeginContact = (contact: Box2D.Box2DWeb.Dynamics.Contacts.b2Contact) => {
			// サッカーボールと地面がぶつかったら地面の色を青にする
			if (b2.isContact(floorBody, soccerBody, contact)) {
				floor.cssColor = "blue";
				floor.modified();
			}
		};
		// 接触が離れた時のイベントリスナー
		contactListener.EndContact = (contact: Box2D.Box2DWeb.Dynamics.Contacts.b2Contact) => {
			// サッカーボールと地面が離れたら地面の色を黒にする
			if (b2.isContact(floorBody, soccerBody, contact)) {
				floor.cssColor = "black";
				floor.modified();
			}
		};
		// イベントリスナーを設定
		b2.world.SetContactListener(contactListener);

		soccer.touchable = true;
		soccer.pointDown.add((o: g.PointDownEvent) => {
			const pos = getEntityPosition(soccer);
			const delta = {
				x: o.point.x - soccer.width / 2,
				y: o.point.y - soccer.height / 2
			};
			// ボールクリックでインパルスを与える
			// ApplyImpulse()はBox2Dの機能です。
			soccerBody.b2body.ApplyImpulse(b2.vec2(delta.x * -5, delta.y * -5), b2.vec2(pos.x, pos.y));
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
