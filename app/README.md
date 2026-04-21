# app（前端技術說明）

本資料夾是遊戲前端程式，使用 React + Vite + Tailwind + Firebase。

## 技術棧

- React 19
- Vite 7
- Tailwind CSS 4
- React Router
- Firebase（Auth / Firestore / Storage）
- html5-qrcode（掃碼）
- dnd-kit（拖曳互動）

## 快速開始

```bash
cd app
npm install
npm run dev
```

常用指令：

- `npm run dev`：開發模式
- `npm run build`：正式建置
- `npm run preview`：預覽建置結果
- `npm run lint`：程式碼檢查

## 環境變數

請建立 `app/.env`（可參考 `.env.example`）並設定：

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_ADMIN_EMAIL`：管理員 Google 帳號（可設定多個管理員，詳見下方說明）

若未完整設定，系統會進入本機 fallback 模式（不連 Firebase）。

## 主要資料流

- 小隊登入：匿名登入 + `teams/{teamId}` 小隊檔案
- 關卡進度：`teams/{teamId}/progress/{levelId}`
- 挑戰場次：`teams/{teamId}/challengeSessions/{sessionId}`
- 掃碼紀錄：`teams/{teamId}/scanAccess/{routeKey}`
- 冷卻資料：`teams/{teamId}/cooldowns/{levelId}`
- 上傳紀錄：`teams/{teamId}/uploads/{uploadId}`
- 合成協作：`synthesisSessions/{stationCode}`（跨隊共用）
- 管理員清單：`admins/{email}`（存在即視為管理員）

## 測試流程建議

1. 先登入建立小隊
2. 以 QR 或短碼（`1`~`8`）依序測關
3. 驗證關卡完成後進度是否更新（背包與任務狀態）
4. 測試合成站是否能依食材狀態正確進入
5. 測試跨隊合作（至少兩台裝置）

QR code 對照請見：`../docs/QR_Code_文字清單.md`

## 後臺管理系統

本專案提供一個管理後臺，可即時監控所有小隊狀態並執行隊伍刪除。

### 進入方式

1. 開啟路由：`/admin`
2. 點擊「使用 Google 帳號登入」，以**管理員 Google 帳號**授權
3. 驗證通過後自動跳轉至 `/admin/dashboard`

### 管理員權限設定

系統支援兩種管理員認證方式（任一符合即可）：

**方式一：環境變數（單一帳號）**

在 `.env` 設定：

```
VITE_ADMIN_EMAIL=your-admin@gmail.com
```

**方式二：Firestore 清單（多帳號）**

在 Firebase Firestore 建立 `admins` 集合，以 email 為文件 ID，文件內容可為空物件：

```
admins/
  your-admin@gmail.com     ← 文件存在即代表是管理員
  another-admin@gmail.com
```

### 後臺功能

**儀表板總覽**

- 顯示所有隊伍數量、進行中場次數、已結束場次數
- 即時更新（Firestore 即時監聽）
- 可依隊伍名稱或 ID 搜尋

**隊伍詳情（點擊任一隊伍卡片）**

| 分頁 | 內容 |
|------|------|
| 進度 | 挑戰開始／結束時間、剩餘時間、各關卡完成狀態、已收集食材、天線顏色與通關碼 |
| 記錄 | 歷次挑戰場次清單與各場次關卡完成情形 |
| 圖片 | 該隊伍上傳的所有照片（可點擊開啟原圖） |

**刪除隊伍**

在隊伍詳情底部點擊「刪除此隊伍」，二次確認後執行。會一併刪除：

- Firestore `teams/{teamId}` 主文件
- `progress`、`uploads`、`scanAccess`、`cooldowns`
- `challengeSessions` 與其下 `progress`/`cooldowns` 子集合

### 登出

點擊右上角「登出」按鈕，清除 Google 登入狀態並返回 `/admin` 登入頁。

### 安全建議（正式活動前請確認）

- 確認 `VITE_ADMIN_EMAIL` 已設定正確帳號，或在 Firestore `admins` 集合中已建立對應文件
- 未通過驗證的 Google 帳號會被立即登出，不會進入後臺
- 不要在對外展示畫面或投影片上直接顯示 `/admin` 路徑資訊
