import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type Auth,
} from 'firebase/auth'
import { auth, db, secondaryAuth } from '@/config/firebase'
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'

export interface UserProfile {
  uid: string
  username: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
}

// Create a new user account
export const createUserAccount = async (
  username: string,
  email: string,
  password: string,
  role: 'admin' | 'user' = 'user',
  authInstance: Auth = auth
): Promise<UserProfile> => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password)
    const user = userCredential.user

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      username,
      email,
      role,
      createdAt: new Date().toISOString(),
    }

    await setDoc(doc(db, 'users', user.uid), userProfile)

    return userProfile
  } catch (error) {
    console.error('Error creating user account:', error)
    throw error
  }
}

export const createAdminAccount = async (
  username: string,
  email: string,
  password: string
): Promise<UserProfile> => {
  return createUserAccount(username, email, password, 'admin', secondaryAuth)
}

// Sign in user
export const signInUser = async (email: string, password: string): Promise<UserProfile> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    if (!userDoc.exists()) {
      throw new Error('User profile not found')
    }

    return userDoc.data() as UserProfile
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Get user by username
export const getUserByUsername = async (username: string): Promise<UserProfile | null> => {
  try {
    const usersCollection = collection(db, 'users')
    const q = query(usersCollection, where('username', '==', username))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    return querySnapshot.docs[0].data() as UserProfile
  } catch (error) {
    console.error('Error getting user by username:', error)
    throw error
  }
}

// Get current user profile
export const getCurrentUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (!userDoc.exists()) {
      return null
    }
    return userDoc.data() as UserProfile
  } catch (error) {
    console.error('Error getting current user profile:', error)
    throw error
  }
}

// Check if username exists
export const checkUsernameExists = async (username: string): Promise<boolean> => {
  try {
    const user = await getUserByUsername(username)
    return user !== null
  } catch (error) {
    console.error('Error checking username:', error)
    return false
  }
}

export const changeCurrentUserPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = auth.currentUser
  const email = user?.email

  if (!user || !email) {
    throw new Error('No authenticated user')
  }

  const credential = EmailAuthProvider.credential(email, currentPassword)
  await reauthenticateWithCredential(user, credential)
  await updatePassword(user, newPassword)
}
