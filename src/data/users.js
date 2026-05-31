import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

// 로그인 시 users/{uid} 문서 자동 생성/업데이트
export async function ensureUser(user) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      babies: [],
      activeBabyId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    // 프로필 정보만 갱신 (babies/activeBabyId는 보존)
    await updateDoc(ref, {
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      updatedAt: serverTimestamp(),
    });
  }
}

export function subscribeUser(uid, cb) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    cb(snap.exists() ? snap.data() : null);
  });
}

export async function setActiveBaby(uid, babyId) {
  await updateDoc(doc(db, 'users', uid), { activeBabyId: babyId, updatedAt: serverTimestamp() });
}
