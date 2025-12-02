import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'

export interface BorrowingRecord {
  id?: string
  docId?: string
  itemName: string
  borrower: string
  department: string
  borrowDate: string
  dueDate: string
  location: string
  status: 'active' | 'overdue' | 'returned'
  returnedAt?: string
  returnedBy?: string
  createdAt?: Timestamp
}

export interface DefaultSettings {
  id?: string
  defaultItemName: string
  defaultLocation: string
  defaultDepartment: string
  customItems: string[]
  customLocations: string[]
  customDepartments: string[]
  userId?: string
  updatedAt?: Timestamp
}

// Borrowing Records Operations
export const addBorrowingRecord = async (record: BorrowingRecord) => {
  try {
    const docRef = await addDoc(collection(db, 'borrowingRecords'), {
      ...record,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding borrowing record:', error)
    throw error
  }
}

export const getBorrowingRecords = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'borrowingRecords'))
    const records: BorrowingRecord[] = []
    querySnapshot.forEach((doc) => {
      records.push({
        docId: doc.id,
        ...doc.data(),
      } as BorrowingRecord)
    })
    return records
  } catch (error) {
    console.error('Error getting borrowing records:', error)
    throw error
  }
}

export const updateBorrowingRecord = async (docId: string, updates: Partial<BorrowingRecord>) => {
  try {
    const docRef = doc(db, 'borrowingRecords', docId)
    await updateDoc(docRef, updates)
  } catch (error) {
    console.error('Error updating borrowing record:', error)
    throw error
  }
}

export const deleteBorrowingRecord = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'borrowingRecords', id))
  } catch (error) {
    console.error('Error deleting borrowing record:', error)
    throw error
  }
}

// Default Settings Operations
export const saveDefaultSettings = async (settings: DefaultSettings) => {
  try {
    const settingsCollection = collection(db, 'defaultSettings')
    const q = query(settingsCollection, where('userId', '==', 'default'))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      // Create new settings document
      const docRef = await addDoc(settingsCollection, {
        ...settings,
        userId: 'default',
        updatedAt: Timestamp.now(),
      })
      return docRef.id
    } else {
      // Update existing settings document
      const docId = querySnapshot.docs[0].id
      const docRef = doc(db, 'defaultSettings', docId)
      await updateDoc(docRef, {
        ...settings,
        updatedAt: Timestamp.now(),
      })
      return docId
    }
  } catch (error) {
    console.error('Error saving default settings:', error)
    throw error
  }
}

export const getDefaultSettings = async (): Promise<DefaultSettings | null> => {
  try {
    const settingsCollection = collection(db, 'defaultSettings')
    const q = query(settingsCollection, where('userId', '==', 'default'))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
    } as DefaultSettings
  } catch (error) {
    console.error('Error getting default settings:', error)
    throw error
  }
}
