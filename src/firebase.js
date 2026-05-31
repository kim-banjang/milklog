import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// .env.local 미설정 시 getAuth가 throw → 앱 전체 블랭크. 설정 여부를 먼저 판별.
export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (firebaseReady) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} else {
  // eslint-disable-next-line no-console
  console.warn('[MilkLog] Firebase 환경변수 미설정 — .env.local 을 채워주세요 (VITE_FIREBASE_*)');
}

export { auth, db, googleProvider };
export default app;
