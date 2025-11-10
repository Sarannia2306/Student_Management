// Firebase initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js';
import { getAuth, setPersistence, browserLocalPersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { getDatabase, ref, get, set } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyBhTBfIGw87CVtyHd8LputmcHkCbhj8KFw",
  authDomain: "student-management-38749.firebaseapp.com",
  databaseURL: "https://student-management-38749-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "student-management-38749",
  storageBucket: "student-management-38749.firebasestorage.app",
  messagingSenderId: "3786439409",
  appId: "1:3786439409:web:1c5da3fa9ab6a79d8f8750",
  measurementId: "G-33C3N8VMX9"
};

const app = initializeApp(firebaseConfig);
try { getAnalytics(app); } catch (e) { console.warn('Analytics not initialized:', e?.message || e); }
const auth = getAuth(app);
const db = getDatabase(app);
await setPersistence(auth, browserLocalPersistence);

async function getUserProfile(uid) {
  const snap = await get(ref(db, `users/${uid}`));
  return snap.exists() ? snap.val() : null;
}

async function setUserProfile(uid, data) {
  await set(ref(db, `users/${uid}`), data);
}

async function registerUser(email, password, role, profile) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  const userProfile = { uid, email, role, ...profile, createdAt: new Date().toISOString() };
  await setUserProfile(uid, userProfile);
  return userProfile;
}

async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(cred.user.uid);
  return { uid: cred.user.uid, email: cred.user.email, ...profile };
}

async function doSignOut() { await signOut(auth); }

window.FirebaseAPI = {
  app, auth, db,
  signIn, registerUser, doSignOut, getUserProfile, setUserProfile, onAuthStateChanged,
};
