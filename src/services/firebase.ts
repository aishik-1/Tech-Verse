import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Profile, Sticker, Achievement, Idea, IdeaLike, ChatMessage } from '../types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID (CRITICAL: Database will not function without this)
export const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Operations & Error Handling as specified by Firebase Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot (CRITICAL CONSTRAINT)
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(firestore, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

// Trigger connection validation immediately
testConnection();

// Google Sign-in with Firebase Auth
export async function signInWithGoogle(): Promise<{ user: Profile; firebaseUser: FirebaseUser }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;

    const userRef = doc(firestore, 'profiles', fbUser.uid);
    let profileData: Profile;

    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        profileData = snap.data() as Profile;
      } else {
        const isAdminUser = fbUser.email === 'aishik.roy1234@gmail.com' || fbUser.email === 'admin@techverse.bst.edu';
        profileData = {
          id: fbUser.uid,
          full_name: fbUser.displayName || 'Tech Club Member',
          email: fbUser.email || '',
          avatar_url: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}&backgroundColor=06b6d4`,
          bio: 'BST Tech Club Member | Exploring Autonomous Systems & Cloud Technologies.',
          roll_number: 'BST-2024-' + Math.floor(100 + Math.random() * 900),
          year: '2nd Year',
          role: isAdminUser ? 'admin' : 'student',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await setDoc(userRef, profileData);

        // Also save to public profiles (without PII email)
        const publicRef = doc(firestore, 'public_profiles', fbUser.uid);
        const { email: _unusedEmail, ...publicData } = profileData;
        await setDoc(publicRef, publicData);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `profiles/${fbUser.uid}`);
    }

    return { user: profileData, firebaseUser: fbUser };
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
}

export async function firebaseSignOut(): Promise<void> {
  await fbSignOut(auth);
}

// Listen to Auth State
export function onAuthUserChanged(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// Firestore Persistence Helpers
export async function writeDocToFirestore<T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  try {
    const docRef = doc(firestore, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}

export async function deleteDocFromFirestore(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(firestore, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${docId}`);
  }
}

export async function updateDocInFirestore(
  collectionName: string,
  docId: string,
  data: Partial<Record<string, any>>
): Promise<void> {
  try {
    const docRef = doc(firestore, collectionName, docId);
    await updateDoc(docRef, data);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${collectionName}/${docId}`);
  }
}

// Real-time Firestore Subscriptions
export function subscribeToFirestoreCollection<T>(
  colName: string,
  onUpdate: (items: T[]) => void,
  sortField = 'created_at',
  sortDirection: 'asc' | 'desc' = 'desc'
): () => void {
  const colRef = collection(firestore, colName);
  const q = query(colRef, orderBy(sortField, sortDirection), limit(150));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as T) }));
      onUpdate(items);
    },
    (error) => {
      console.warn(`Firestore subscription fallback for ${colName}:`, error.message);
    }
  );
}

// Seed initial data to Firestore if empty
export async function seedFirestoreCollectionIfEmpty<T extends { id: string }>(
  colName: string,
  seedData: T[]
): Promise<void> {
  try {
    const colRef = collection(firestore, colName);
    const snap = await getDocs(query(colRef, limit(1)));
    if (snap.empty && seedData.length > 0) {
      for (const item of seedData) {
        await setDoc(doc(firestore, colName, item.id), item);
      }
    }
  } catch (err) {
    // If not permitted or offline, log warning and let client use memory fallback
    console.warn(`Seed check for ${colName}:`, err);
  }
}
