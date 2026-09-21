# 🎮 高雄知識王 — KAOHSIUNG QUIZ KING

> React Vite + Pixel Art + Google Apps Script 後端的闖關問答遊戲

---

## 快速開始

```bash
# 1. 安裝依賴
npm install

# 2. 設定環境變數
cp .env.example .env
# 編輯 .env，填入你的 GAS URL

# 3. 啟動開發伺服器
npm run dev

# 4. 打包預覽
npm run build
npm run preview
```

---

## 環境變數設定（`.env`）

| 變數名稱 | 說明 | 預設範例 |
|---|---|---|
| `VITE_GOOGLE_APP_SCRIPT_URL` | GAS 部署後端 URL | `https://script.google.com/macros/s/xxx/exec` |
| `VITE_PASS_THRESHOLD` | 通關需答對題數 | `6` |
| `VITE_QUESTION_COUNT` | 每次隨機取幾題 | `10` |

---

## 🚀 部署至 GitHub Pages 流程

本專案已配置 **GitHub Actions** 自動部署流程 (`.github/workflows/deploy.yml`)。

### 步驟 1：避免上傳敏感與暫存檔案
專案已設定完整 `.gitignore`，上傳時會自動過濾：
- 敏感設定檔（`.env`）
- 套件資料夾（`node_modules/`）
- 打包與暫存資料夾（`dist/`, `build/`）
- 系統與日誌檔（`*.log`, `.DS_Store`）

### 步驟 2：設定 GitHub Repository Secrets
為了讓 GitHub Actions 打包時能存取環境變數，請在 GitHub 儲存庫設定 Secrets：
1. 進入 GitHub 專案頁面 -> **Settings** -> **Secrets and variables** -> **Actions**
2. 點擊 **New repository secret**，新增以下 Secret：
   - Name: `VITE_GOOGLE_APP_SCRIPT_URL`
   - Value: `你的 Google Apps Script 網頁應用程式 URL`
3. (選用) 可另外新增 `VITE_PASS_THRESHOLD` 與 `VITE_QUESTION_COUNT`。

### 步驟 3：開啟 GitHub Pages 服務
1. 進入 GitHub 專案頁面 -> **Settings** -> **Pages**
2. 在 **Build and deployment** 下的 **Source** 選項中，切換為 **`GitHub Actions`**。

### 步驟 4：推送程式碼上傳
執行以下 Git 指令將專案推送到 GitHub：

```bash
git init
git add .
git commit -m "feat: setup project with GitHub Actions deployment"
git branch -M main
git remote add origin https://github.com/你的帳號/你的儲存庫名稱.git
git push -u origin main
```

推送成功後，GitHub Actions 會自動觸發建置與部署，完成後可在 **Settings -> Pages** 查看您的網站連結！

---

## Google Sheets 設定

### 1. 建立 Google Sheets

新建一份試算表，建立兩個工作表：

#### 工作表 1：`題目`
| 題號 | 題目 | A | B | C | D | 解答 |
|---|---|---|---|---|---|---|
| 1 | 駁二特區早期是什麼倉庫？ | 港區倉庫 | 糖業倉庫 | 軍糧倉庫 | 鹽業倉庫 | A |
| 2 | ... | ... | ... | ... | ... | ... |

> ⚠️ 工作表名稱必須完全符合「題目」（含中文）

#### 工作表 2：`回答`
| ID | 闖關次數 | 總分 | 最高分 | 第一次通關分數 | 花了幾次通關 | 最近遊玩時間 |
|---|---|---|---|---|---|---|

> 標題列不需要手動建立，GAS 會自動 appendRow

### 2. 部署 Google Apps Script

1. 在 Google Sheets 中：**擴充功能 → Apps Script**
2. 刪除預設程式碼，複製貼上 `gas/Code.gs` 的完整內容
3. 點選 **部署 → 新增部署**
4. 設定：
   - 類型：**網頁應用程式**
   - 執行身份：**我**（你的 Google 帳號）
   - 存取權限：**所有人（包含匿名）** ⚠️ 務必選擇所有人
5. 點選「部署」，複製產生的 URL。

---

## 專案結構

```
quiz-game/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions 自動部署工作流
├── gas/
│   └── Code.gs              # Google Apps Script 後端程式碼
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── utils/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js
```
