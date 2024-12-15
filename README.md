# 🎲 Roulette Server MCP

このプロジェクトは、Model Context Protocol (MCP)を使用したサイコロシミュレーションサーバーです。

## 🌟 機能

- 🎲 サイコロを振るツール
- 📊 サイコロの結果を保存するリソース
- 📜 サイコロの履歴を表示するプロンプト

## 🚀 使い方

### インストール

```bash
npm install roulette-server2
```

### サーバーの起動

```bash
npx roulette-server2
```

## 🛠 開発

### 依存関係のインストール

```bash
npm install
```

### ビルド

```bash
npm run build
```

### テスト

```bash
npm test
```

## 📖 API

### ツール

- `roll_dice`: サイコロを振ります。オプションでサイコロの面の数を指定できます（デフォルトは6面）。

### リソース

- `dice:///[id]`: 特定のサイコロの結果を取得します。

### プロンプト

- `dice_history`: サイコロの履歴を要約します。

## 🤝 貢献

プルリクエストは歓迎します。大きな変更を加える場合は、まずissueを開いて変更内容を議論してください。

## 📄 ライセンス

[MIT](https://choosealicense.com/licenses/mit/)
