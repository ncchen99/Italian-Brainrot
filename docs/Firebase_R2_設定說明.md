# Firebase 設定說明

## 1) 前端環境變數

請在 `app/.env` 依照 `app/.env.example` 填入：

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 2) Firebase 功能

目前已接入：

- 匿名登入（Anonymous Auth）
- 小隊資料：`teams/{teamId}`
- 關卡進度：`teams/{teamId}/progress/{levelId}`
- 冷卻時間：`teams/{teamId}/cooldowns/{levelId}`
- 上傳紀錄：`teams/{teamId}/uploads/{autoId}`
- 掃碼紀錄：`teams/{teamId}/scanAccess/{routeKey}`

## 3) Firebase Storage 上傳流程

前端可直接使用 Firebase SDK 上傳，流程如下：

1. 前端使用 `uploadBytes` 將圖片寫入 Firebase Storage 路徑（例如：`uploads/{teamId}/{levelId}/...`）。
2. 上傳成功後使用 `getDownloadURL` 取得可讀取的圖片 URL。
4. 將圖片 URL 寫回 Firestore 上傳紀錄與關卡進度。

## 4) Firebase Storage 規則建議

可先使用測試規則（僅供開發）：

```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{teamId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

若專案使用匿名登入，`request.auth != null` 同樣可通過驗證。

## 5) 手機測試建議

- Android Chrome：測試登入、全螢幕、QR 掃描、拖曳、Level6 上傳。
- iOS Safari：重點驗證全螢幕降級提示與相機權限流程。
