# Family Gourmet - セットアップ手順

## 必要なもの
- Node.js（https://nodejs.org からインストール）
- VS Code（https://code.visualstudio.com からインストール）
- GitHubアカウント（https://github.com）
- Vercelアカウント（https://vercel.com）

---

## 1. ローカルで動かす

### ① このフォルダをVS Codeで開く
VS Codeを起動 → 「フォルダーを開く」→ このfamily-gourmetフォルダを選択

### ② ターミナルを開いてパッケージをインストール
VS Code上部メニュー「ターミナル」→「新しいターミナル」

```bash
npm install
```

### ③ 起動
```bash
npm run dev
```

ブラウザで http://localhost:5173 を開くとアプリが表示されます。

---

## 2. Firebaseのセキュリティルールを設定

1. Firebase Console（https://console.firebase.google.com）を開く
2. プロジェクト「family-gourmet」を選択
3. 左メニュー「Firestore Database」→「ルール」タブ
4. `firestore.rules` の内容を貼り付けて「公開」

---

## 3. GitHubにアップロード

1. https://github.com にログイン
2. 「New repository」→ 名前を「family-gourmet」にして作成
3. VS Codeターミナルで以下を実行（YOUR_USERNAMEは自分のGitHubユーザー名）：

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/family-gourmet.git
git push -u origin main
```

---

## 4. Vercelで公開（無料）

1. https://vercel.com にGitHubでログイン
2. 「New Project」→ 「family-gourmet」リポジトリをインポート
3. 設定はそのままで「Deploy」をクリック
4. 数分でURLが発行される（例：family-gourmet.vercel.app）

---

## 5. iPhoneのホーム画面に追加

1. iPhoneのSafariでVercelのURLを開く
2. 画面下の「共有」ボタン（□に↑）をタップ
3. 「ホーム画面に追加」をタップ
4. 「追加」をタップ

これでアイコンがホーム画面に追加されます！

---

## 家族と共有する方法

VercelのURLを家族に送るだけです。
それぞれGoogleアカウントでログインすれば、同じデータを共有できます。
