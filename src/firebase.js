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

export function buildProfileKey(name, pin) {
  const cleanName = (name || '')
    .trim()
    .toLowerCase()
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]/g, '');
  const cleanPin = (pin || '').trim().replace(/[^a-zA-Z0-9]/g, '');
  return `${cleanName || 'user'}_${cleanPin}`;
}

export async function fetchOrCreateCloudProfile(displayName, pin, localSnapshot) {
  const profileKey = buildProfileKey(displayName, pin);
  const docRef = doc(db, 'profiles', profileKey);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const cloudData = snap.data();
    return {
      profileKey,
      isNew: false,
      data: cloudData
    };
  } else {
    const initialPayload = {
      displayName: displayName.trim(),
      pin: pin.trim(),
      userAnswers: localSnapshot.userAnswers || {},
      quizProgress: localSnapshot.quizProgress || {},
      fcStatus: localSnapshot.fcStatus || {},
      examHistory: localSnapshot.examHistory || [],
      lastActiveQuiz: localSnapshot.lastActiveQuiz || null,
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, initialPayload);
    return {
      profileKey,
      isNew: true,
      data: initialPayload
    };
  }
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
