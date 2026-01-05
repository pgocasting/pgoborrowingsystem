import { getApp, getApps, initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyBcqV54toDXuSrVOcxEt8gUAZZ4jG1Vo_k',
  authDomain: 'pgoborrowingsystem.firebaseapp.com',
  projectId: 'pgoborrowingsystem',
  storageBucket: 'pgoborrowingsystem.firebasestorage.app',
  messagingSenderId: '809595453534',
  appId: '1:809595453534:web:085ee0d8d90f5eab7174cf',
  measurementId: 'G-H57JKP3J9M',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Auth
export const auth = getAuth(app)

const secondaryApp = getApps().some((a) => a.name === 'secondary')
  ? getApp('secondary')
  : initializeApp(firebaseConfig, 'secondary')

export const secondaryAuth = getAuth(secondaryApp)

export default app
