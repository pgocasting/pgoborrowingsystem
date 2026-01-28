import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, LogOut } from 'lucide-react'
import BorrowingItem from './BorrowingItem'
import NewBorrowingModal from './NewBorrowingModal'
import type { NewBorrowingData } from './NewBorrowingModal'
import EditBorrowingModal, { type EditBorrowingInitialData, type EditBorrowingUpdates } from './EditBorrowingModal'
import SettingsModal from './SettingsModal'
import type { DefaultSettings } from './SettingsModal'
import ReturnSuccessModal from './ReturnSuccessModal'
import Sidebar from './Sidebar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  addBorrowingRecord,
  getBorrowingRecords,
  updateBorrowingRecord,
  getDefaultSettings,
  deleteBorrowingRecord,
  type BorrowingRecord,
} from '@/services/firebaseService'

interface MainPageProps {
  username: string
  onLogout: () => void
}

export default function MainPage({ username, onLogout }: MainPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isReturnSuccessOpen, setIsReturnSuccessOpen] = useState(false)
  const [returnedItemName, setReturnedItemName] = useState('')
  const [returnedAt, setReturnedAt] = useState('')
  const [returnedByName, setReturnedByName] = useState('')
  const [loadError, setLoadError] = useState<string>('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [submitError, setSubmitError] = useState<string>('')
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [canRenderPage, setCanRenderPage] = useState(false)
  
  const [defaultSettings, setDefaultSettings] = useState<DefaultSettings>({
    defaultItemName: '',
    defaultLocation: '',
    defaultDepartment: '',
    customItems: [],
    customLocations: [],
    customDepartments: [],
  })
  
  const [borrowingRecords, setBorrowingRecords] = useState<BorrowingRecord[]>([])
  const [editingRecord, setEditingRecord] = useState<BorrowingRecord | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'borrowed' | 'overdue' | 'returned'>('all')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  
  // Load data from Firebase on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadError('')
        setIsDataLoading(true)
        setCanRenderPage(false)
        setLoadingProgress(0)
        const records = await getBorrowingRecords()
        setBorrowingRecords(records)

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
        const err = error as { code?: string; message?: string }
        setLoadError(
          `Failed to load data from Firestore. ${err?.code ? `(${err.code}) ` : ''}${err?.message || ''}`
        )
      } finally {
        setIsDataLoading(false)
        setLoadingProgress(100)
      }
    }

    loadData()
  }, [])

  const handleEditSave = async (id: string, updates: EditBorrowingUpdates) => {
    try {
      const record = borrowingRecords.find((r) => r.id === id)
      if (!record?.docId) return

      await updateBorrowingRecord(record.docId, updates, record.borrowDate)
      setBorrowingRecords(
        borrowingRecords.map((r) => (r.id === id ? { ...r, ...updates } : r))
      )
    } catch (error) {
      console.error('Error updating record:', error)
    }
  }

  useEffect(() => {
    if (!isDataLoading) return
    const interval = setInterval(() => {
      setLoadingProgress((p) => {
        if (p >= 95) return 95
        return Math.min(95, p + 15)
      })
    }, 80)
    return () => clearInterval(interval)
  }, [isDataLoading])

  useEffect(() => {
    if (!isDataLoading && loadingProgress >= 100) {
      const t = setTimeout(() => setCanRenderPage(true), 50)
      return () => clearTimeout(t)
    }
  }, [isDataLoading, loadingProgress])

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

  // Sync sidebar tabs with status filter
  useEffect(() => {
    if (activeTab === 'borrowings') {
      setStatusFilter('all')
    } else if (activeTab === 'active') {
      setStatusFilter('borrowed')
    } else if (activeTab === 'returned') {
      setStatusFilter('returned')
    } else if (activeTab === 'overdue') {
      setStatusFilter('overdue')
    }
  }, [activeTab])

  if (!canRenderPage) {
    return (
      <div className="min-h-screen loading-rgb-bg flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-28 w-28">
            <svg
              viewBox="0 0 841.9 595.3"
              className="h-28 w-28 animate-spin"
              aria-label="Loading"
            >
              <g fill="none" stroke="white" strokeWidth="28">
                <ellipse cx="420.9" cy="296.5" rx="165" ry="64" />
                <ellipse cx="420.9" cy="296.5" rx="165" ry="64" transform="rotate(60 420.9 296.5)" />
                <ellipse cx="420.9" cy="296.5" rx="165" ry="64" transform="rotate(120 420.9 296.5)" />
              </g>
              <circle cx="420.9" cy="296.5" r="44" fill="white" />
            </svg>
          </div>
          <div className="mx-auto w-56 max-w-[70vw]">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-200 ease-out"
                data-progress={loadingProgress}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Helper to determine overdue based on dueDate for non-returned items
  const isRecordOverdue = (r: BorrowingRecord) => {
    if (r.status === 'returned') return false
    try {
      return new Date(r.dueDate) < new Date()
    } catch {
      return false
    }
  }

  const filteredRecords = borrowingRecords
    .filter(
      (record) =>
        record.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${record.firstName} ${record.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.id?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    )
    .filter((r) => {
      if (statusFilter === 'all') return true
      if (statusFilter === 'returned') return r.status === 'returned'
      if (statusFilter === 'overdue') return r.status === 'overdue' || (r.status === 'active' && isRecordOverdue(r))
      // borrowed = active but NOT overdue
      return r.status === 'active' && !isRecordOverdue(r)
    })

  const handleReturn = async (id: string, returnedBy: string) => {
    try {
      const record = borrowingRecords.find((r) => r.id === id)
      if (record?.docId) {
        const now = new Date().toISOString()
        await updateBorrowingRecord(record.docId, {
          status: 'returned', 
          returnedAt: now,
          returnedBy: returnedBy
        }, record.borrowDate)
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
        await updateBorrowingRecord(record.docId, { dueDate: newDueDate }, record.borrowDate)
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

  const performDelete = async (id: string) => {
    try {
      const record = borrowingRecords.find((r) => r.id === id)
      if (!record?.docId) return
      await deleteBorrowingRecord(record.docId, record.borrowDate)
      setBorrowingRecords(borrowingRecords.filter((r) => r.id !== id))
    } catch (error) {
      console.error('Error deleting record:', error)
    }
  }

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id)
  }

  const handleNewBorrowing = async (data: NewBorrowingData) => {
    try {
      setSubmitError('')

      // Generate formatted ID: BRW001, BRW002, etc.
      // IMPORTANT: Do not use borrowingRecords.length. After refresh (or partial fetch),
      // it can produce duplicate IDs and overwrite existing Firestore documents.
      const maxExisting = borrowingRecords.reduce((max, r) => {
        const match = (r.id || '').match(/^BRW(\d+)$/)
        const n = match ? Number(match[1]) : 0
        return Number.isFinite(n) ? Math.max(max, n) : max
      }, 0)
      const nextNumber = maxExisting + 1
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
      const err = error as { code?: string; message?: string }
      setSubmitError(
        `Failed to save new borrowing to Firestore. ${err?.code ? `(${err.code}) ` : ''}${err?.message || ''}`
      )
    }
  }

  const overdueCount = borrowingRecords.filter(
    (r) => r.status === 'overdue' || (r.status === 'active' && isRecordOverdue(r))
  ).length
  const activeCount = borrowingRecords.filter(
    (r) => r.status === 'active' && !isRecordOverdue(r)
  ).length
  const returnedCount = borrowingRecords.filter((r) => r.status === 'returned').length

  return (
    <div className="h-screen w-screen main-gradient-bg flex overflow-hidden">
      <Sidebar 
        username={username} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenNewBorrowing={() => setIsModalOpen(true)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="main-gradient-bg border-b border-white/15 shrink-0">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="/images/bataan-logo.png"
                  alt="Bataan Logo"
                  className="h-9 w-9 sm:h-10 sm:w-10 object-contain shrink-0"
                />
                <div className="min-w-0">
                  <h1 className="text-base sm:text-2xl font-bold text-white leading-tight truncate">PGO Borrowing System</h1>
                  <p className="text-sm text-white/80 mt-0.5 truncate">Welcome, {username}</p>
                </div>
              </div>

              {/* Desktop: show Settings + Logout on the same row */}
              <div className="hidden sm:flex gap-2 items-center shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={onLogout}
                  className="px-4 bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="ml-2">Logout</span>
                </Button>
              </div>

              {/* Mobile: hamburger menu */}
              <div className="sm:hidden">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}
        {submitError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white"></h1>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{borrowingRecords.length}</div>
                  <p className="text-xs text-gray-500 mt-1">All borrowing records</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{activeCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Currently borrowed</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Overdue Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Need attention</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Returned Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{returnedCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Completed returns</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {borrowingRecords.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full shrink-0 ${
                          record.status === 'active' ? 'bg-blue-500' :
                          record.status === 'overdue' ? 'bg-red-500' :
                          'bg-green-500'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 text-sm truncate">{record.itemName}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {record.department} • {record.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          record.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {record.status === 'returned' ? 'Returned' : 
                           record.status === 'overdue' ? 'Overdue' : 'Active'}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {record.status === 'returned' ? record.returnedAt : record.borrowDate}
                        </p>
                      </div>
                    </div>
                  ))}
                  {borrowingRecords.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Borrowing Items View */}
        {activeTab !== 'dashboard' && (
          <>
        {/* Borrowing Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <BorrowingItem
                key={record.id}
                {...record}
                id={record.id!}
                purpose={record.purpose ?? ''}
                itemImageUrl={defaultSettings.customItems.find((i) => i.name === record.itemName)?.imageUrl}
                onReturn={(returnedBy: string) => handleReturn(record.id!, returnedBy)}
                onExtend={(newDueDate: string) => handleExtend(record.id!, newDueDate)}
                onEdit={() => {
                  setEditingRecord(record)
                  setIsEditModalOpen(true)
                }}
                onDelete={() => handleDelete(record.id!)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No borrowing records found</p>
            </div>
          )}
        </div>

        {/* New Borrowing Modal */}
        <NewBorrowingModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSubmit={handleNewBorrowing}
          defaultSettings={defaultSettings}
          existingRecords={borrowingRecords}
        />

        <EditBorrowingModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          initialData={
            editingRecord
              ? ({
                  itemName: editingRecord.itemName,
                  firstName: editingRecord.firstName,
                  lastName: editingRecord.lastName,
                  department: editingRecord.department,
                  location: editingRecord.location,
                  purpose: editingRecord.purpose || '',
                  borrowDate: editingRecord.borrowDate,
                  dueDate: editingRecord.dueDate,
                } satisfies EditBorrowingInitialData)
              : null
          }
          defaultSettings={defaultSettings}
          onConfirm={(updates) => {
            if (!editingRecord?.id) return
            handleEditSave(editingRecord.id, updates)
          }}
        />

        {/* Delete Confirmation Modal */}
        <Dialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete borrowing record</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the borrowing record.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (deleteConfirmId) {
                    const id = deleteConfirmId
                    setDeleteConfirmId(null)
                    await performDelete(id)
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
          </>
        )}

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
      </main>
    </div>
    </div>
  )
}
