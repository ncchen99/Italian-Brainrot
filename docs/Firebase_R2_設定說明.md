# Firebase 設定說明

## 1) 前端環境變數

請在 `app/.env` 依照 `app/.env.example` 填入：

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 2) Firebase 功能與權限 (重要)

本專案使用 **Firestore 集合** 來管理後臺權限。請務必完成以下手動設定：

### A. 建立管理員清單 (Firestore)
1. 前往 Firebase Console -> **Firestore Database**。
2. 點擊「開始使用集合」，集合名稱輸入：`admins`。
3. 新增文件：
   - **文件 ID**：直接輸入你的 **Google 帳號 Email** (例如 `your-name@gmail.com`)。需注意全小寫。
   - **欄位**：`role`: `admin` (字串)。
4. 未來若要增加管理員，只需在此集合新增該人員的 Email 文件即可。

### B. 支援的功能路徑
- 匿名登入 (Anonymous Auth)
- 小隊資料：`teams/{teamId}`
- 關卡進度：`teams/{teamId}/progress/{levelId}`
- 冷卻時間：`teams/{teamId}/cooldowns/{levelId}`
- 上傳紀錄：`teams/{teamId}/uploads/{autoId}`
- 掃碼紀錄：`teams/{teamId}/scanAccess/{routeKey}`
- 挑戰場次：`teams/{teamId}/challengeSessions/{sessionId}`
- 合成協作站：`synthesisSessions/{stationCode}`（跨隊共用，root-level 集合）

## 3) Firebase Storage 上傳流程

前端可直接使用 Firebase SDK 上傳，流程如下：

1. 前端使用 `uploadBytes` 將圖片寫入 Firebase Storage 路徑（例如：`uploads/{teamId}/{levelId}/...`）。
2. 上傳成功後使用 `getDownloadURL` 取得可讀取的圖片 URL。
4. 將圖片 URL 寫回 Firestore 上傳紀錄與關卡進度。

## 4) Firebase Storage 規則建議

請在 Firebase Console -> Storage -> Rules 貼入以下規則。管理員將擁有所有圖片的讀取與刪除權限。

```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 輔助函式：檢查是否為管理員 (讀取 Firestore admins 集合)
    function isAdmin() {
      return request.auth != null && 
             firestore.exists(/databases/(default)/documents/admins/$(request.auth.token.email));
    }

    // 圖片路徑規則：uploads/{teamId}/{allPaths=**}
    match /uploads/{teamId}/{allPaths=**} {
      // 隊伍本人可讀寫；管理員可讀取與刪除
      allow read: if request.auth.uid == teamId || isAdmin();
      allow write: if request.auth.uid == teamId || isAdmin();
    }
  }
}
```

若專案使用匿名登入，`request.auth != null` 同樣可通過驗證。

## 5) Firestore 規則建議（重要）

目前專案有三個跨隊伍查詢需求：
1. **合成支援**：`getSynthesisSupportPlan` 會讀取其他隊伍的 session 進度
2. **後臺管理**：Admin 必須能讀取所有隊伍的全部子集合（sessions、progress、uploads 等）
3. **合成協作站**：`synthesisSessions/{stationCode}` 是 root-level 集合，任何登入中的隊伍都必須能讀寫

請改用以下規則（可直接貼到 Firebase Console → Firestore → Rules）：

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }
    function isOwner(teamId) {
      return signedIn() && request.auth.uid == teamId;
    }
    // 從 admins 集合中檢查當前使用者的 Email 是否存在
    function isAdmin() {
      return signedIn() && exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }

    // teams 主文件：只有本人或 admin 可以刪除
    match /teams/{teamId} {
      allow read: if signedIn();
      allow write: if isOwner(teamId) || isAdmin();
    }

    // 子文件（progress、cooldowns、uploads、scanAccess 等）：本人或 admin 可讀寫
    match /teams/{teamId}/{document=**} {
      allow read, write: if isOwner(teamId) || isAdmin();
    }

    // challengeSessions 主文件：管理員與已登入用戶可讀；本人或 admin 可寫
    match /teams/{teamId}/challengeSessions/{sessionId} {
      allow read: if signedIn();
      allow write: if isOwner(teamId) || isAdmin();
    }

    // session progress：管理員與已登入用戶可讀；本人或 admin 可寫
    match /teams/{teamId}/challengeSessions/{sessionId}/progress/{levelId} {
      allow read: if signedIn();
      allow write: if isOwner(teamId) || isAdmin();
    }

    // 合成協作站：跨隊共用，任何登入中的玩家皆可讀寫
    match /synthesisSessions/{stationCode} {
      allow read, write: if signedIn();
    }
  }
}
```

## 6) 手機測試建議

- Android Chrome：測試登入、全螢幕、QR 掃描、拖曳、Level6 上傳。
- iOS Safari：重點驗證全螢幕降級提示與相機權限流程。
