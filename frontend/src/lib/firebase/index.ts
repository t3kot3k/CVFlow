export { auth, db, storage, googleProvider } from "./config";
export {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  resetPassword,
  getUserProfile,
  getIdToken,
  type UserProfile,
} from "./auth";
