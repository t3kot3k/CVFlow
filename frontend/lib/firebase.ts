import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCustomToken as firebaseSignInWithCustomToken,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Prevent re-initialization in Next.js hot reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

// LinkedIn OIDC provider — provider ID must match what was set in Firebase Console
const linkedinProvider = new OAuthProvider("oidc.cvflow");
linkedinProvider.addScope("openid");
linkedinProvider.addScope("profile");
linkedinProvider.addScope("email");

/**
 * Get the current user's Firebase ID token for API authentication.
 * Returns null if no user is logged in.
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

/**
 * Get the current user (synchronous).
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Subscribe to auth state changes.
 */
export { onAuthStateChanged, auth };

// Auth actions
export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUp = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signInWithCustomToken = (token: string) =>
  firebaseSignInWithCustomToken(auth, token);

// Popup-based sign-in (preferred on desktop, may be blocked by browser)
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithLinkedIn = () => signInWithPopup(auth, linkedinProvider);

// Redirect-based sign-in (fallback when popups are blocked)
export const signInWithGoogleRedirect = () =>
  signInWithRedirect(auth, googleProvider);
export const signInWithLinkedInRedirect = () =>
  signInWithRedirect(auth, linkedinProvider);

/**
 * Call on page load to retrieve the result of a redirect sign-in.
 * Returns null if no redirect was pending.
 */
export const getAuthRedirectResult = () => getRedirectResult(auth);

export const logOut = () => signOut(auth);

export type { User };
