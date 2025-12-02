import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, Plus, Search, Settings } from 'lucide-react'
import BorrowingItem from './BorrowingItem'
import NewBorrowingModal from './NewBorrowingModal'
import type { NewBorrowingData } from './NewBorrowingModal'
import SettingsModal from './SettingsModal'
import type { DefaultSettings } from './SettingsModal'
import ReturnSuccessModal from './ReturnSuccessModal'
import {
  addBorrowingRecord,
  getBorrowingRecords,
  updateBorrowingRecord,
  deleteBorrowingRecord,
  saveDefaultSettings,
  getDefaultSettings,
  type BorrowingRecord,
} from '@/services/firebaseService'

interface MainPageProps {
  username: string
  onLogout: () => void
}

export default function MainPage({ username, onLogout }: MainPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isReturnSuccessOpen, setIsReturnSuccessOpen] = useState(false)
  const [returnedItemName, setReturnedItemName] = useState('')
  const [returnedAt, setReturnedAt] = useState('')
  const [returnedByName, setReturnedByName] = useState('')
  
  const [defaultSettings, setDefaultSettings] = useState<DefaultSettings>({
    defaultItemName: '',
    defaultLocation: '',
    defaultDepartment: '',
    customItems: [],
    customLocations: [],
    customDepartments: [],
  })
  
  const [borrowingRecords, setBorrowingRecords] = useState<BorrowingRecord[]>([])

  // Load data from Firebase on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        // Load borrowing records
        const records = await getBorrowingRecords()
        setBorrowingRecords(records)

        // Load default settings
        const settings = await getDefaultSettings()
        if (settings) {
          setDefaultSettings({
            defaultItemName: settings.defaultItemName || '',
            defaultLocation: settings.defaultLocation || '',
            defaultDepartment: settings.defaultDepartment || '',
            customItems: settings.customItems || [],
            customLocations: settings.customLocations || [],
            customDepartments: settings.customDepartments || [],
          })
        }
      } catch (error) {
        console.error('Error loading data from Firebase:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Reload settings when settings modal opens
  useEffect(() => {
    if (isSettingsOpen) {
      const reloadSettings = async () => {
        try {
          const settings = await getDefaultSettings()
          if (settings) {
            setDefaultSettings({
              defaultItemName: settings.defaultItemName || '',
              defaultLocation: settings.defaultLocation || '',
              defaultDepartment: settings.defaultDepartment || '',
              customItems: settings.customItems || [],
              customLocations: settings.customLocations || [],
              customDepartments: settings.customDepartments || [],
            })
          }
        } catch (error) {
          console.error('Error reloading settings:', error)
        }
      }
      reloadSettings()
    }
  }, [isSettingsOpen])

  const filteredRecords = borrowingRecords.filter(
    (record) =>
      record.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.borrower.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleReturn = async (id: string, returnedBy: string) => {
    try {
      const record = borrowingRecords.find((r) => r.id === id)
      if (record?.docId) {
        const now = new Date().toISOString()
        await updateBorrowingRecord(record.docId, { 
          status: 'returned', 
          returnedAt: now,
          returnedBy: returnedBy
        })
        setBorrowingRecords(
          borrowingRecords.map((r) =>
            r.id === id ? { ...r, status: 'returned', returnedAt: now, returnedBy: returnedBy } : r
          )
        )
        // Show success modal
        setReturnedItemName(record.itemName)
        setReturnedAt(now)
        setReturnedByName(returnedBy)
        setIsReturnSuccessOpen(true)
      }
    } catch (error) {
      console.error('Error updating record status:', error)
    }
  }

  const handleExtend = async (id: string, newDueDate: string) => {
    try {
      const record = borrowingRecords.find((r) => r.id === id)
      if (record?.docId) {
        await updateBorrowingRecord(record.docId, { dueDate: newDueDate })
        setBorrowingRecords(
          borrowingRecords.map((r) => {
            if (r.id === id) {
              return { ...r, dueDate: newDueDate }
            }
            return r
          })
        )
      }
    } catch (error) {
      console.error('Error extending due date:', error)
    }
  }

  const handleNewBorrowing = async (data: NewBorrowingData) => {
    try {
      // Generate formatted ID: BRW001, BRW002, etc.
      const nextNumber = borrowingRecords.length + 1
      const formattedId = `BRW${String(nextNumber).padStart(3, '0')}`
      
      const newRecord: BorrowingRecord = {
        id: formattedId,
        ...data,
        status: 'active',
      }
      const firestoreDocId = await addBorrowingRecord(newRecord)
      const recordWithIds = { ...newRecord, id: formattedId, docId: firestoreDocId }
      setBorrowingRecords([recordWithIds, ...borrowingRecords])
    } catch (error) {
      console.error('Error adding borrowing record:', error)
    }
  }

  const activeCount = borrowingRecords.filter((r) => r.status === 'active').length
  const overdueCount = borrowingRecords.filter((r) => r.status === 'overdue').length
  const returnedCount = borrowingRecords.filter((r) => r.status === 'returned').length

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PGO Borrowing System</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome, {username}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="gap-2"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={onLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Borrowings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{activeCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Overdue Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{overdueCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Returned Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{returnedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by item name, borrower, or ID..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            New Borrowing
          </Button>
        </div>

        {/* New Borrowing Modal */}
        <NewBorrowingModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSubmit={handleNewBorrowing}
          defaultSettings={defaultSettings}
        />

        {/* Settings Modal */}
        <SettingsModal
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          onSave={setDefaultSettings}
          currentSettings={defaultSettings}
        />

        {/* Return Success Modal */}
        <ReturnSuccessModal
          open={isReturnSuccessOpen}
          onOpenChange={setIsReturnSuccessOpen}
          itemName={returnedItemName}
          returnedAt={returnedAt}
          returnedBy={returnedByName}
        />

        {/* Borrowing Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <BorrowingItem
                key={record.id}
                {...record}
                onReturn={(returnedBy: string) => handleReturn(record.id, returnedBy)}
                onExtend={(newDueDate: string) => handleExtend(record.id, newDueDate)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No borrowing records found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
