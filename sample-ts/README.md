# これは

`@akashic-extension/akashic-box2d` の [サンプルコンテンツ](../sample) をTypeScriptで作成したものです。

## ビルド方法

ビルドにはNode.jsが必要です。

`npm run build` によりgulpを使ってビルドできます。

`src` ディレクトリ以下のTypeScriptファイルがコンパイルされ、`game/script` ディレクトリ以下にJavaScriptファイルが生成されます。

```sh
npm install
npm run build
```

`game` ディレクトリに移動して依存モジュールをインストールします。

```sh
cd game
npm install
```

## 実行方法
ビルド後に `sample-ts` ディレクトリ内で以下のコマンドを実行し、 `http://localhost:3000` にアクセスすることで実行できます。

```
npm start
```

## テスト方法

1. [TSLint](https://github.com/palantir/tslint "TSLint") を使ったLint
2. [Jasmine](http://jasmine.github.io "Jasmine") を使ったテスト

がそれぞれ実行されます。

```sh
npm test
```
