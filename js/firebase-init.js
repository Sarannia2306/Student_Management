async function reloadCurrentUser() {
  if (!auth.currentUser) throw new Error('No authenticated user');
  await reload(auth.currentUser);
  return { emailVerified: !!auth.currentUser.emailVerified, uid: auth.currentUser.uid, email: auth.currentUser.email };
}
async function sendVerificationEmailNow() {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  await sendEmailVerification(user, {
    url: 'https://student-management-38749.web.app',
    handleCodeInApp: false
  });
}
// Firebase initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js';
import { getAuth, setPersistence, indexedDBLocalPersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, reload, updateProfile } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js';
import { getDatabase, ref, get, set, update } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyBhTBfIGw87CVtyHd8LputmcHkCbhj8KFw",
  authDomain: "student-management-38749.firebaseapp.com",
  databaseURL: "https://student-management-38749-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "student-management-38749",
  storageBucket: "student-management-38749.appspot.com",
  messagingSenderId: "3786439409",
  appId: "1:3786439409:web:1c5da3fa9ab6a79d8f8750",
  measurementId: "G-33C3N8VMX9"
};

const app = initializeApp(firebaseConfig);
try { getAnalytics(app); } catch (e) { console.warn('Analytics not initialized:', e?.message || e); }
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);
await setPersistence(auth, indexedDBLocalPersistence);

async function getUserProfile(uid) {
  const snap = await get(ref(db, `users/${uid}`));
  return snap.exists() ? snap.val() : null;
}

async function setUserProfile(uid, data) {
  await set(ref(db, `users/${uid}`), data);
}

async function updateUserProfile(uid, data) {
  await update(ref(db, `users/${uid}`), data);
}

// List all students (role === 'student')
async function listStudents() {
  const snap = await get(ref(db, 'users'));
  const out = [];
  if (snap.exists()) {
    snap.forEach(child => {
      const v = child.val();
      if (v && v.role === 'student') {
        out.push({ ...v, uid: child.key });
      }
    });
  }
  return out;
}

// Programs helpers
async function listPrograms() {
  const snap = await get(ref(db, 'programs'));
  const out = [];
  if (snap.exists()) {
    snap.forEach(child => {
      const v = child.val();
      if (v) out.push({ ...v, id: child.key });
    });
  }
  return out;
}

async function saveProgramRecord(id, data) {
  if (!id) throw new Error('Program id is required');
  await update(ref(db, `programs/${id}`), data);
}

async function deleteProgramRecord(id) {
  if (!id) throw new Error('Program id is required');
  await set(ref(db, `programs/${id}`), null);
}

// Hash a string with SHA-256 and return hex
async function sha256Hex(text) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(String(text)));
  const bytes = Array.from(new Uint8Array(buf));
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

// IC hash mapping helpers
async function icExists(icHash) {
  const snap = await get(ref(db, `icIndex/${icHash}`));
  return snap.exists();
}

async function setIcIndex(icHash, uid) {
  await set(ref(db, `icIndex/${icHash}`), { uid, ts: Date.now() });
}

async function registerUser(email, password, role, profile) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  const userProfile = { uid, email, role, verified: false, ...profile, createdAt: new Date().toISOString() };
  await setUserProfile(uid, userProfile);
  try {
    await sendEmailVerification(cred.user, {
      // Adjust URL to your hosted app; user returns here after clicking the email link
      url: 'https://student-management-38749.web.app',
      handleCodeInApp: false
    });
  } catch (_) {}
  return userProfile;
}

async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(cred.user.uid);
  return { uid: cred.user.uid, email: cred.user.email, emailVerified: !!cred.user.emailVerified, ...profile };
}

async function doSignOut() { await signOut(auth); }

async function sendPasswordReset(email) {
  if (!email) throw new Error('Email is required');
  await sendPasswordResetEmail(auth, email);
}

// Upload profile photo to Firebase Storage and return download URL
async function uploadProfilePhoto(file) {
  if (!auth.currentUser) throw new Error('No authenticated user');
  if (!(file instanceof File)) throw new Error('Invalid file');
  const uid = auth.currentUser.uid;
  const ext = (file.type || 'image/jpeg').split('/')[1] || 'jpg';
  const safeExt = ext === 'jpeg' ? 'jpg' : ext;
  const path = `profilePhotos/${uid}.${safeExt}`;
  const refObj = storageRef(storage, path);
  await uploadBytes(refObj, file, { contentType: file.type || 'image/jpeg' });
  const url = await getDownloadURL(refObj);
  return url;
}

// Update Firebase Auth user photoURL
async function updateAuthPhotoURL(url) {
  if (!auth.currentUser) throw new Error('No authenticated user');
  await updateProfile(auth.currentUser, { photoURL: url });
}

// Backend OTP helpers (configure endpoints to your PHP scripts)
async function sendOtp({ uid, email }) {
  const res = await fetch('/api/send-otp.php', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, email })
  });
  if (!res.ok) throw new Error('Failed to send verification code');
  return res.json().catch(() => ({}));
}

async function verifyOtp({ uid, code }) {
  const res = await fetch('/api/verify-otp.php', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, code })
  });
  if (!res.ok) throw new Error('Invalid or expired verification code');
  return res.json().catch(() => ({}));
}

window.FirebaseAPI = {
  app, auth, db,
  signIn, registerUser, doSignOut, getUserProfile, setUserProfile, updateUserProfile,
  listStudents, listPrograms, saveProgramRecord, deleteProgramRecord,
  onAuthStateChanged,
  sendOtp, verifyOtp,
  sendVerificationEmailNow,
  reloadCurrentUser,
  sha256Hex, icExists, setIcIndex,
  uploadProfilePhoto, updateAuthPhotoURL,
  sendPasswordReset,
};
