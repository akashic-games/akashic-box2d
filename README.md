<p align="center">
<img src="img/akashic.png"/>
</p>

# akashic-box2d

**akashic-box2d** は、2D物理演算ライブラリである[Box2D.ts](https://github.com/flyover/box2d.ts)をAkashicで利用するためのモジュールです。

本モジュールでは、AkashicでBox2D.tsを使う際に便利となるよう、次の機能を提供します。

* AkashicのエンティティとBox2Dとの紐づけ
* スケールや角度などの単位変換メソッド
* その他便利な機能の提供

本モジュールは **AkashicとBox2Dとの紐づけ** と **一部の便利機能** のみを提供しています。
そのため、その他多くの機能はBox2を直接利用することになります。

## 利用方法

[akashic-cli](https://github.com/akashic-games/akashic-cli)をインストールした後、

```sh
akashic install @akashic-extension/akashic-box2d
```

でインストールできます。コンテンツからは、

```javascript
var b2 = require("@akashic-extension/akashic-box2d");
```

で利用してください。
詳細な利用方法については、以下を参照してください。

* [akashic-box2dの利用方法](https://github.com/akashic-games/akashic-box2d/blob/master/getstarted.md)
* [akashic-box2dの利用方法 (v2以前)](https://github.com/akashic-games/akashic-box2d/blob/master/getstarted_outdated.md)
* [APIリファレンス](https://akashic-games.github.io/reference/akashic-box2d/index.html)
* このリポジトリ同梱のサンプルコンテンツ
  * [JavaScript](https://github.com/akashic-games/akashic-box2d/blob/master/sample)
  * [TypeScript](https://github.com/akashic-games/akashic-box2d/blob/master/sample-ts)

Akashic Engineの詳細な利用方法については、 [公式ページ](https://akashic-games.github.io/) を参照してください。

## ビルド方法

**akashic-box2d** はTypeScriptで書かれたライブラリであるため、ビルドにはNode.jsが必要です。

`npm run build` によりgulpを使ってビルドできます。

```sh
npm install
npm run build
```

## テスト方法

```sh
npm test
```

## 注意点

Box2D.ts では `Math.random()` が使われている箇所があります。

* `b2Random()`
* `b2RandomRange()`

該当メソッドは利用せず、かわりに `g.game.random` を利用してください。

## ライセンス
本リポジトリは MIT License の元で公開されています。
詳しくは [LICENSE](https://github.com/akashic-games/akashic-box2d/blob/master/LICENSE) をご覧ください。

ただし、画像ファイルおよび音声ファイルは
[CC BY 2.1 JP](https://creativecommons.org/licenses/by/2.1/jp/) の元で公開されています。
