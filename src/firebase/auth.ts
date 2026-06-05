import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import type { UserCredential } from 'firebase/auth';
import { getFirebaseAuth } from './config';

export function loginWithEmail(email: string, password: string): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout(): Promise<void> {
  const auth = getFirebaseAuth();
  return signOut(auth);
}
