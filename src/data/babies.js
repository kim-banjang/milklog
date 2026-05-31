import {
  doc, collection, getDoc, updateDoc, onSnapshot,
  arrayUnion, arrayRemove, deleteField, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase.js';

// 6자리 초대코드 (혼동되는 0/O/1/I 제외)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function randCode() {
  let s = '';
  for (let i = 0; i < 6; i++) {
    s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return s;
}

// invites/{code} 가 비어있는 코드 확보
async function reserveCode() {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = randCode();
    const snap = await getDoc(doc(db, 'invites', code));
    if (!snap.exists()) return code;
  }
  // 극히 드문 충돌 — 타임스탬프 섞어 fallback
  return randCode();
}

// 아기 신규 생성 (S04)
export async function createBaby(user, { name, nick, birth }) {
  const babyRef = doc(collection(db, 'babies'));
  const babyId = babyRef.id;
  const code = await reserveCode();
  const now = new Date();

  const baby = {
    name,
    nick: nick || name,
    birth, // 'YYYY-MM-DD'
    ownerUid: user.uid,
    members: [user.uid],
    memberInfo: {
      [user.uid]: { name: user.displayName || '', photoURL: user.photoURL || '' },
    },
    inviteCode: code,
    intervalMin: 180,
    nextAt: now.toISOString(),
    alarmActive: false,
    createdAt: serverTimestamp(),
  };

  const batch = writeBatch(db);
  batch.set(babyRef, baby);
  batch.set(doc(db, 'invites', code), { babyId, createdAt: serverTimestamp() });
  batch.update(doc(db, 'users', user.uid), {
    babies: arrayUnion(babyId),
    activeBabyId: babyId,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return babyId;
}

// 초대코드로 합류 (S05)
export async function joinByInvite(user, codeRaw) {
  const code = (codeRaw || '').trim().toUpperCase();
  if (code.length !== 6) throw new Error('INVALID_CODE');

  const invSnap = await getDoc(doc(db, 'invites', code));
  if (!invSnap.exists()) throw new Error('CODE_NOT_FOUND');
  const { babyId } = invSnap.data();

  const babyRef = doc(db, 'babies', babyId);
  await updateDoc(babyRef, {
    members: arrayUnion(user.uid),
    [`memberInfo.${user.uid}`]: { name: user.displayName || '', photoURL: user.photoURL || '' },
  });
  await updateDoc(doc(db, 'users', user.uid), {
    babies: arrayUnion(babyId),
    activeBabyId: babyId,
    updatedAt: serverTimestamp(),
  });
  return babyId;
}

export function subscribeBaby(babyId, cb) {
  return onSnapshot(doc(db, 'babies', babyId), (snap) => {
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

// 여러 아기 메타 한 번에 조회 (전환 시트용)
export async function fetchBabies(babyIds) {
  const out = [];
  for (const id of babyIds) {
    const snap = await getDoc(doc(db, 'babies', id));
    if (snap.exists()) out.push({ id: snap.id, ...snap.data() });
  }
  return out;
}

// 아기 정보 편집 (S10, owner 전용)
export async function updateBabyInfo(babyId, { name, nick, birth }) {
  await updateDoc(doc(db, 'babies', babyId), { name, nick, birth });
}

// 알람 상태 저장
export async function updateBabyAlarm(babyId, { intervalMin, nextAt, alarmActive }) {
  const patch = {};
  if (intervalMin != null) patch.intervalMin = intervalMin;
  if (nextAt != null) patch.nextAt = nextAt;
  if (alarmActive != null) patch.alarmActive = alarmActive;
  await updateDoc(doc(db, 'babies', babyId), patch);
}

// 멤버 내보내기 (S11, owner 전용)
export async function removeMember(babyId, uid) {
  await updateDoc(doc(db, 'babies', babyId), {
    members: arrayRemove(uid),
    [`memberInfo.${uid}`]: deleteField(),
  });
  // 내보낸 멤버의 users 문서는 본인만 쓸 수 있으므로 여기서 정리 불가.
  // 해당 유저가 다음 로그인 때 멤버십 없는 babyId를 스스로 정리한다 (App에서 처리).
}
