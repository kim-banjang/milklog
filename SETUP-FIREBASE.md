# MilkLog Firebase 연동 — 수동 설정 가이드

코드는 모두 작성됨. 아래 콘솔 작업 3가지만 김반장이 직접 해야 실제 동작한다.

## 1. Firebase 프로젝트 + 웹앱 config
1. https://console.firebase.google.com → 프로젝트 생성 (예: `milklog`)
2. 좌측 톱니 → 프로젝트 설정 → 일반 → 내 앱 → 웹 앱(`</>`) 추가
3. 표시되는 `firebaseConfig` 값 6개를 `.env.local` 에 입력:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=1:...:web:...
   ```
   - `.env.local` 은 `.gitignore` 처리됨 (커밋 안 됨)
   - 값 입력 후 `npm run dev` 재시작 (Vite는 시작 시 env를 읽음)

## 2. Authentication — Google 로그인 활성화
- Firebase 콘솔 → Authentication → Sign-in method → Google → 사용 설정 ON → 저장
- 배포 도메인 추가: Authentication → Settings → 승인된 도메인에 Vercel 도메인 추가
  (`localhost` 는 기본 포함)

## 3. Firestore 생성 + 보안 규칙 배포
- 콘솔 → Firestore Database → 데이터베이스 만들기 (프로덕션 모드)
- 보안 규칙: 리포 루트 `firestore.rules` 내용을 콘솔 → Firestore → 규칙 탭에 붙여넣고 게시
  - 또는 Firebase CLI: `firebase deploy --only firestore:rules`

## 4. Vercel 배포 (기존 프로젝트)
- Vercel 프로젝트 → Settings → Environment Variables 에 위 `VITE_FIREBASE_*` 6개 추가
  (Production / Preview 모두)
- 재배포하면 적용. `vercel.json` 은 이미 존재.

---

## 데이터 구조 (참고)
```
users/{uid}              { displayName, email, photoURL, babies[], activeBabyId }
invites/{code}           { babyId }                       # 6자리 초대코드 → 아기 매핑
babies/{babyId}          { name, nick, birth, ownerUid, members[], memberInfo{},
                           inviteCode, intervalMin, nextAt, alarmActive }
babies/{babyId}/feeds/{feedId}  { ts, prepared, leftover, recordedBy }
```

## 권한 (보안 규칙으로 강제)
- owner: 아기 정보 편집 / 멤버 내보내기 / 모든 기록 수정·삭제
- member: 알람 조정 / 기록 추가 / 본인 기록(recordedBy)만 수정·삭제
- 합류: 초대코드로 본인을 members에 추가하는 것만 허용
