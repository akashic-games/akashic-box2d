# これは

`@akashic-extension/akashic-box2d` の Particle のサンプルです。
TypeScriptで書かれています。

## サンプル内容

* クリック位置に Particle を追加します。
* サッカーボールをドラッグすることで力を与えることができます。

## ビルド方法

ビルドにはNode.jsが必要です。

`npm run build` によりビルドできます。

`src` ディレクトリ以下のTypeScriptファイルがコンパイルされ、`script` ディレクトリ以下にJavaScriptファイルが生成されます。

```sh
npm install
npm run build
```

## 実行方法
ビルド後に以下のコマンドを実行し、 `http://localhost:3000` にアクセスすることで実行できます。

```
npm start
```

## テスト方法

```sh
npm test
```
