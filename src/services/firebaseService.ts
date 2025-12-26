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
  firstName: string
  lastName: string
  department: string
  borrowDate: string
  dueDate: string
  location: string
  status: 'active' | 'overdue' | 'returned'
  returnedAt?: string
  returnedBy?: string
  createdAt?: Timestamp
}

export interface ItemSetting {
  name: string
  imageUrl?: string
}

export interface DefaultSettings {
  id?: string
  defaultItemName: string
  defaultLocation: string
  defaultDepartment: string
  customItems: ItemSetting[]
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

    // Ensure the yearMonth parent document exists so it can be discovered by getBorrowingRecords.
    // Firestore allows writing to subcollections under a missing parent doc, but that parent doc
    // won't show up in collection listings unless it exists.
    await setDoc(
      doc(db, 'borrowingRecords', yearMonth),
      { updatedAt: Timestamp.now() },
      { merge: true }
    )

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
    const seenDocIds = new Set<string>()
    const yearMonthsSnapshot = await getDocs(collection(db, 'borrowingRecords'))

    console.debug('[getBorrowingRecords] yearMonth docs:', yearMonthsSnapshot.size)

    const yearMonthsToScan: string[] = yearMonthsSnapshot.docs.map((d) => d.id)

    // Fallback: if no yearMonth docs are returned (common when parent docs were never created),
    // scan recent months based on current date.
    if (yearMonthsToScan.length === 0) {
      const now = new Date()
      for (let i = 0; i < 18; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        yearMonthsToScan.push(ym)
      }
      console.debug('[getBorrowingRecords] scanning recent yearMonths fallback:', yearMonthsToScan.length)
    }

    for (const yearMonth of yearMonthsToScan) {
      // NOTE: In this app's schema, day is a SUBCOLLECTION under borrowingRecords/{YYYY-MM}.
      // The client SDK cannot list subcollections, so we scan possible days (01..31).
      for (let d = 1; d <= 31; d++) {
        const day = String(d).padStart(2, '0')
        const recordsSnapshot = await getDocs(
          collection(db, 'borrowingRecords', yearMonth, day)
        )

        if (recordsSnapshot.size > 0) {
          console.debug(
            '[getBorrowingRecords] yearMonth/day:',
            `${yearMonth}/${day}`,
            'records:',
            recordsSnapshot.size
          )
        }

        recordsSnapshot.forEach((docSnap) => {
          if (seenDocIds.has(docSnap.id)) return
          seenDocIds.add(docSnap.id)
          records.push({
            docId: docSnap.id,
            ...docSnap.data(),
          } as BorrowingRecord)
        })
      }
    }

    if (records.length > 0) {
      console.debug('[getBorrowingRecords] returning nested records:', records.length)
      return records
    }

    console.debug('[getBorrowingRecords] no nested records found, trying flat collection fallback')
    const flatSnapshot = await getDocs(collection(db, 'borrowingRecords'))
    console.debug('[getBorrowingRecords] flat borrowingRecords docs:', flatSnapshot.size)
    flatSnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>
      if (
        typeof data === 'object' &&
        data !== null &&
        'itemName' in data &&
        'firstName' in data &&
        'lastName' in data
      ) {
        if (seenDocIds.has(docSnap.id)) return
        seenDocIds.add(docSnap.id)
        records.push({
          docId: docSnap.id,
          ...data,
        } as BorrowingRecord)
      }
    })

    console.debug('[getBorrowingRecords] returning flat records:', records.length)
    return records
  } catch (error) {
    const err = error as { code?: string; message?: string }
    console.error('Error getting borrowing records:', err?.code || '', err?.message || '', error)
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
    try {
      const flatRef = doc(db, 'borrowingRecords', docId)
      await updateDoc(flatRef, updates)
    } catch (fallbackError) {
      console.error('Error updating borrowing record:', error)
      throw fallbackError
    }
  }
}

export const deleteBorrowingRecord = async (id: string, borrowDate?: string) => {
  try {
    const dateStr = borrowDate || new Date().toISOString()
    const { yearMonth, day } = getDatePath(dateStr)
    await deleteDoc(doc(db, 'borrowingRecords', yearMonth, day, id))
  } catch (error) {
    try {
      await deleteDoc(doc(db, 'borrowingRecords', id))
    } catch (fallbackError) {
      console.error('Error deleting borrowing record:', error)
      throw fallbackError
    }
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
    const data = doc.data() as Record<string, unknown>

    const rawCustomItems = (data.customItems as unknown) ?? []
    const normalizedCustomItems: ItemSetting[] = Array.isArray(rawCustomItems)
      ? rawCustomItems
          .map((i) => {
            if (typeof i === 'string') return { name: i }
            if (i && typeof i === 'object' && 'name' in i && typeof (i as any).name === 'string') {
              const img = (i as any).imageUrl
              return {
                name: (i as any).name,
                imageUrl: typeof img === 'string' && img.trim() ? img.trim() : undefined,
              }
            }
            return null
          })
          .filter(Boolean) as ItemSetting[]
      : []

    return {
      id: doc.id,
      ...(data as Omit<DefaultSettings, 'id' | 'customItems'>),
      customItems: normalizedCustomItems,
    }
  } catch (error) {
    console.error('Error getting default settings:', error)
    throw error
  }
}
