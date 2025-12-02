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
  setDoc,
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

// Helper function to get date path (yearMonth and day)
const getDatePath = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear().toString()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const yearMonth = `${year}-${month}`
  return { yearMonth, day }
}

// Borrowing Records Operations
export const addBorrowingRecord = async (record: BorrowingRecord) => {
  try {
    const { yearMonth, day } = getDatePath(record.borrowDate)
    
    // Add the record to borrowingRecords/yearMonth/day using the id field as document ID
    const docRef = doc(db, 'borrowingRecords', yearMonth, day, record.id!)
    await setDoc(docRef, {
      ...record,
      createdAt: Timestamp.now(),
    })
    return record.id!
  } catch (error) {
    console.error('Error adding borrowing record:', error)
    throw error
  }
}

export const getBorrowingRecords = async () => {
  try {
    const records: BorrowingRecord[] = []
    const yearMonthsSnapshot = await getDocs(collection(db, 'borrowingRecords'))
    
    for (const yearMonthDoc of yearMonthsSnapshot.docs) {
      const daysSnapshot = await getDocs(
        collection(db, 'borrowingRecords', yearMonthDoc.id)
      )
      
      for (const dayDoc of daysSnapshot.docs) {
        const recordsSnapshot = await getDocs(
          collection(db, 'borrowingRecords', yearMonthDoc.id, dayDoc.id)
        )
        
        recordsSnapshot.forEach((doc) => {
          records.push({
            docId: doc.id,
            ...doc.data(),
          } as BorrowingRecord)
        })
      }
    }
    
    return records
  } catch (error) {
    console.error('Error getting borrowing records:', error)
    throw error
  }
}

export const updateBorrowingRecord = async (
  docId: string,
  updates: Partial<BorrowingRecord>,
  borrowDate?: string
) => {
  try {
    const dateStr = borrowDate || new Date().toISOString()
    const { yearMonth, day } = getDatePath(dateStr)
    const docRef = doc(db, 'borrowingRecords', yearMonth, day, docId)
    await updateDoc(docRef, updates)
  } catch (error) {
    console.error('Error updating borrowing record:', error)
    throw error
  }
}

export const deleteBorrowingRecord = async (id: string, borrowDate?: string) => {
  try {
    const dateStr = borrowDate || new Date().toISOString()
    const { yearMonth, day } = getDatePath(dateStr)
    await deleteDoc(doc(db, 'borrowingRecords', yearMonth, day, id))
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
