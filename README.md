# ReservationSystem
# 予約システム開発プロジェクト

このリポジトリは、病院・診療所向けの予約システムです。  
フロントエンド（Next.js）とバックエンド（Express + PostgreSQL）で構成されています。

---

## 🚀 プロジェクト構成
/frontend → Next.js フロントエンドアプリ
/backend → Express バックエンド API サーバー
/docker-compose.yml → Docker構成

---

## 📚 API ルーティング一覧

### ユーザー認証系 (`/auth`)
| メソッド | エンドポイント               | 説明                   |
|----------|-----------------------------|-----------------------|
| POST     | /auth/register              | ユーザー登録          |
| POST     | /auth/login                 | ユーザーログイン      |
| POST     | /auth/logout                | ユーザーログアウト    |
| POST     | /auth/change-password       | パスワード変更        |
| GET      | /auth/check                 | ログイン状態確認      |

---

### 管理者系 (`/admins`)
| メソッド | エンドポイント                  | 説明                           |
|----------|--------------------------------|-------------------------------|
| GET      | /admins                        | 管理者一覧取得（role別）       |
| POST     | /admins/register               | 管理者アカウント登録           |
| GET      | /admins/:id                    | 管理者情報取得（ID指定）       |
| PUT      | /admins/:id                    | 管理者情報更新                 |
| DELETE   | /admins/:id                    | 管理者論理削除                 |
| PUT      | /admins/:id/password           | 管理者パスワード更新           |

---

### 予約関連 (`/reservations`)
| メソッド | エンドポイント            | 説明               |
|----------|--------------------------|-------------------|
| GET      | /reservations            | 予約一覧取得       |
| POST     | /reservations            | 予約登録           |
| GET      | /reservations/:id        | 予約詳細取得       |
| PUT      | /reservations/:id        | 予約更新           |
| DELETE   | /reservations/:id        | 予約キャンセル     |

---

### その他管理系
| エンドポイント系     | 説明               |
|----------------------|-------------------|
| /facilities          | 施設管理 API       |
| /departments         | 診療科管理 API     |
| /doctors            | 医師管理 API       |
| /holidays           | 休診日管理 API     |
| /notifications      | 通知設定 API       |
| /group              | 施設グループ管理 API|

---

## ⚙️ 環境変数（例 `.env`）

SESSION_SECRET=your-secret-key
DATABASE_URL=postgres://user:password@db:5432/reservations
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password

---

## 🐳 Docker コマンド例

- ビルド＆起動:
docker-compose up --build

- DB に初期データ投入（必要時）:
docker exec -i your_db_container psql -U user -d reservations < seed.sql

---

## 📌 注意点

✅ **`init.sql`** → DB初期構造を定義  
✅ **`seed.sql`** → 初期データ投入用、必要なときだけ手動実行  

---

## 📝 今後の拡張予定

- LINE 通知連携
- 多言語対応（日本語・英語・中国語・韓国語）
- モバイルアプリ連携
- 統計・分析ダッシュボード

---

