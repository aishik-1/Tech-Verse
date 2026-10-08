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

// Immediately trigger connection validation
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
        // Create new profile for Google user
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

// Realtime listeners with secure error handling
export function subscribeToChatMessages(
  onUpdate: (messages: ChatMessage[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const colPath = 'chat_messages';
  const q = query(collection(firestore, colPath), orderBy('created_at', 'asc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs = snapshot.docs.map((docSnap) => docSnap.data() as ChatMessage);
      onUpdate(msgs);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, colPath);
    }
  );
}

export function subscribeToIdeas(
  onUpdate: (ideas: Idea[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const colPath = 'ideas';
  const q = query(collection(firestore, colPath), orderBy('created_at', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => docSnap.data() as Idea);
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, colPath);
    }
  );
}
