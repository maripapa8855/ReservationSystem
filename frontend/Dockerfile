# ベースイメージ（Node.js公式、軽量なAlpineベース）
FROM node:18-alpine

# 作業ディレクトリの設定
WORKDIR /app

# package.jsonとlockファイルを先にコピー（キャッシュ効率向上）
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# アプリケーションコード全体をコピー
COPY . .

# ポート番号（Next.js開発サーバーのデフォルト）
EXPOSE 3000

# 起動コマンド
CMD ["npm", "run", "dev"]
