import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

// Utilitaires snake_case
const toSnake = (obj: any) => {
  if (Array.isArray(obj)) return obj.map(toSnake);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k.replace(/[A-Z]/g, l => "_" + l.toLowerCase()), toSnake(v)])
    );
  }
  return obj;
};
const fromSnake = (obj: any) => {
  if (Array.isArray(obj)) return obj.map(fromSnake);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k.replace(/_([a-z])/g, (_, l) => l.toUpperCase()), fromSnake(v)])
    );
  }
  return obj;
};

export async function syncCollection(uid: string, key: string, local: any[], setLocal: (arr: any[]) => void) {
  const col = collection(db, "users", uid, key);
  // Charger depuis Firestore
  const snap = await getDocs(col);
  setLocal(snap.docs.map(d => ({ ...fromSnake(d.data()), id: d.id })));
}

export async function saveDoc(uid: string, key: string, obj: any) {
  const ref = doc(db, "users", uid, key, obj.id);
  await setDoc(ref, toSnake(obj));
}

export async function deleteDocFS(uid: string, key: string, id: string) {
  const ref = doc(db, "users", uid, key, id);
  await deleteDoc(ref);
}
