import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAbFTs7ZDjhkIn-hhyqnybHL1V2NgqXOyM',
  authDomain: 'cografiya-miq-portal.firebaseapp.com',
  projectId: 'cografiya-miq-portal',
  storageBucket: 'cografiya-miq-portal.firebasestorage.app',
  messagingSenderId: '960894847671',
  appId: '1:960894847671:web:09c56deeb191f6a5a31b32'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export function normalizeUsername(username) {
  const clean = (username || '')
    .trim()
    .toLowerCase()
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z0-9_.-]/g, '');
  return `user_${clean || 'guest'}`;
}

export async function registerCloudAccount(fullName, username, password, localSnapshot) {
  const profileKey = normalizeUsername(username);
  const docRef = doc(db, 'profiles', profileKey);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    throw new Error('USERNAME_EXISTS');
  }

  const initialPayload = {
    displayName: fullName.trim().slice(0, 60),
    pin: password.trim(),
    userAnswers: localSnapshot.userAnswers || {},
    quizProgress: localSnapshot.quizProgress || {},
    fcStatus: localSnapshot.fcStatus || {},
    examHistory: (localSnapshot.examHistory || []).slice(0, 50),
    lastActiveQuiz: localSnapshot.lastActiveQuiz || null,
    updatedAt: new Date().toISOString()
  };

  await setDoc(docRef, initialPayload);
  return {
    profileKey,
    username: username.trim().toLowerCase(),
    data: initialPayload
  };
}

export async function loginCloudAccount(username, password) {
  const profileKey = normalizeUsername(username);
  const docRef = doc(db, 'profiles', profileKey);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    throw new Error('USER_NOT_FOUND');
  }

  const cloudData = snap.data();
  if (cloudData.pin !== password.trim()) {
    throw new Error('WRONG_PASSWORD');
  }

  return {
    profileKey,
    username: username.trim().toLowerCase(),
    data: cloudData
  };
}

export async function syncProfileToCloud(profileKey, payload) {
  if (!profileKey) return;
  const docRef = doc(db, 'profiles', profileKey);
  await setDoc(
    docRef,
    {
      displayName: payload.displayName,
      pin: payload.pin,
      userAnswers: payload.userAnswers || {},
      quizProgress: payload.quizProgress || {},
      fcStatus: payload.fcStatus || {},
      examHistory: (payload.examHistory || []).slice(0, 50),
      lastActiveQuiz: payload.lastActiveQuiz || null,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );
}

export function subscribeToCloudProfile(profileKey, onUpdate) {
  if (!profileKey) return () => {};
  const docRef = doc(db, 'profiles', profileKey);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data());
      }
    },
    (err) => {
      console.warn('Cloud profile sync warning:', err);
    }
  );
}
