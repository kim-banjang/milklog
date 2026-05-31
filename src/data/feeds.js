import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';

function feedsCol(babyId) {
  return collection(db, 'babies', babyId, 'feeds');
}

// 실시간 구독 — ts 내림차순. cb(logs[])
export function subscribeFeeds(babyId, cb) {
  const q = query(feedsCol(babyId), orderBy('ts', 'desc'));
  return onSnapshot(q, (snap) => {
    const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(logs);
  });
}

export async function addFeed(babyId, uid, { ts, prepared, leftover }) {
  await addDoc(feedsCol(babyId), {
    ts, // ISO string
    prepared,
    leftover,
    recordedBy: uid,
    createdAt: serverTimestamp(),
  });
}

export async function updateFeed(babyId, feedId, patch) {
  await updateDoc(doc(db, 'babies', babyId, 'feeds', feedId), patch);
}

export async function deleteFeed(babyId, feedId) {
  await deleteDoc(doc(db, 'babies', babyId, 'feeds', feedId));
}
