import { useState, useEffect, useRef } from 'react'
import { saveDefaultSettings } from '@/services/firebaseService'
import { changeCurrentUserPassword } from '@/services/authService'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Plus, Upload, Download } from 'lucide-react'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (settings: DefaultSettings) => void
  currentSettings: DefaultSettings
}

export interface DefaultSettings {
  defaultItemName: string
  defaultLocation: string
  defaultDepartment: string
  customItems: string[]
  customLocations: string[]
  customDepartments: string[]
}

const PREDEFINED_ITEMS: string[] = []

const PREDEFINED_LOCATIONS: string[] = []

const PREDEFINED_DEPARTMENTS: string[] = []

export default function SettingsModal({
  open,
  onOpenChange,
  onSave,
  currentSettings,
}: SettingsModalProps) {
  const [settings, setSettings] = useState<DefaultSettings>(currentSettings)
  const [newItem, setNewItem] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newDepartment, setNewDepartment] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'items' | 'locations' | 'departments' | 'import' | 'password'>('items')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Sync settings when currentSettings prop changes (from Firebase reload)
  useEffect(() => {
    setSettings(currentSettings)
  }, [currentSettings])

  const allItems = [...PREDEFINED_ITEMS, ...settings.customItems]
  const allLocations = [...PREDEFINED_LOCATIONS, ...settings.customLocations]
  const allDepartments = [...PREDEFINED_DEPARTMENTS, ...settings.customDepartments]

  const handleDeleteItem = (item: string) => {
    setSettings((prev) => ({
      ...prev,
      customItems: prev.customItems.filter((i) => i !== item),
    }))
  }

  const handleDeleteLocation = (location: string) => {
    setSettings((prev) => ({
      ...prev,
      customLocations: prev.customLocations.filter((l) => l !== location),
    }))
  }

  const handleDeleteDepartment = (department: string) => {
    setSettings((prev) => ({
      ...prev,
      customDepartments: prev.customDepartments.filter((d) => d !== department),
    }))
  }

  const handleSave = async () => {
    try {
      // Save to Firebase
      await saveDefaultSettings(settings)
      // Call parent callback
      onSave(settings)
      setSuccessMessage('Settings saved successfully!')
      // Clear only input fields, keep the saved data
      setNewItem('')
      setNewLocation('')
      setNewDepartment('')
      // Clear success message after 2 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('')
      }, 2000)
      return () => clearTimeout(timer)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSuccessMessage('Error saving settings. Please try again.')
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    }
  }

  const handleReset = () => {
    setSettings({
      defaultItemName: '',
      defaultLocation: '',
      defaultDepartment: '',
      customItems: [],
      customLocations: [],
      customDepartments: [],
    })
  }

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter((line) => line.trim())
        
        const newItems: string[] = []
        const newLocations: string[] = []
        const newDepartments: string[] = []

        lines.forEach((line) => {
          const [category, value] = line.split(',').map((s) => s.trim())
          if (!category || !value) return

          const categoryLower = category.toLowerCase()
          if (categoryLower === 'item' && !allItems.includes(value)) {
            newItems.push(value)
          } else if (categoryLower === 'location' && !allLocations.includes(value)) {
            newLocations.push(value)
          } else if (categoryLower === 'department' && !allDepartments.includes(value)) {
            newDepartments.push(value)
          }
        })

        setSettings((prev) => ({
          ...prev,
          customItems: [...new Set([...prev.customItems, ...newItems])],
          customLocations: [...new Set([...prev.customLocations, ...newLocations])],
          customDepartments: [...new Set([...prev.customDepartments, ...newDepartments])],
        }))

        setSuccessMessage(`Imported ${newItems.length + newLocations.length + newDepartments.length} items successfully!`)
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (error) {
        console.error('Error importing file:', error)
        setSuccessMessage('Error importing file. Please check the format.')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleExportTemplate = () => {
    const template = `item,Sample Item 1
item,Sample Item 2
location,Sample Location 1
location,Sample Location 2
department,Sample Department 1
department,Sample Department 2`

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(template))
    element.setAttribute('download', 'import_template.csv')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleChangePassword = async () => {
    try {
      setPasswordMessage('')

      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordMessage('Please fill in all password fields')
        return
      }

      if (newPassword !== confirmPassword) {
        setPasswordMessage('New password and confirmation do not match')
        return
      }

      if (newPassword.length < 6) {
        setPasswordMessage('New password must be at least 6 characters')
        return
      }

      setIsChangingPassword(true)
      await changeCurrentUserPassword(currentPassword, newPassword)
      setPasswordMessage('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordMessage(''), 2000)
    } catch (error) {
      console.error('Error changing password:', error)
      setPasswordMessage('Error changing password. Please check your current password and try again.')
      setTimeout(() => setPasswordMessage(''), 3000)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const renderCategoryContent = (category: 'items' | 'locations' | 'departments') => {
    const isItems = category === 'items'
    const isLocations = category === 'locations'

    const newValue = isItems ? newItem : isLocations ? newLocation : newDepartment
    const setNewValue = isItems ? setNewItem : isLocations ? setNewLocation : setNewDepartment
    const items = isItems ? settings.customItems : isLocations ? settings.customLocations : settings.customDepartments
    const allItemsList = isItems ? allItems : isLocations ? allLocations : allDepartments
    const handleDelete = isItems ? handleDeleteItem : isLocations ? handleDeleteLocation : handleDeleteDepartment
    const placeholder = isItems ? 'Add new item' : isLocations ? 'Add new location' : 'Add new department'
    const label = isItems ? 'Items' : isLocations ? 'Locations' : 'Departments'

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newValue.trim()) {
                if (!allItemsList.includes(newValue.trim())) {
                  if (isItems) {
                    setSettings((prev) => ({
                      ...prev,
                      customItems: [...prev.customItems, newValue.trim()],
                    }))
                  } else if (isLocations) {
                    setSettings((prev) => ({
                      ...prev,
                      customLocations: [...prev.customLocations, newValue.trim()],
                    }))
                  } else {
                    setSettings((prev) => ({
                      ...prev,
                      customDepartments: [...prev.customDepartments, newValue.trim()],
                    }))
                  }
                  setNewValue('')
                }
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={() => {
              if (newValue.trim() && !allItemsList.includes(newValue.trim())) {
                if (isItems) {
                  setSettings((prev) => ({
                    ...prev,
                    customItems: [...prev.customItems, newValue.trim()],
                  }))
                } else if (isLocations) {
                  setSettings((prev) => ({
                    ...prev,
                    customLocations: [...prev.customLocations, newValue.trim()],
                  }))
                } else {
                  setSettings((prev) => ({
                    ...prev,
                    customDepartments: [...prev.customDepartments, newValue.trim()],
                  }))
                }
                setNewValue('')
              }
            }}
            size="sm"
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
            {items.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm hover:shadow-md transition-shadow"
              >
                <span className="text-gray-800 font-medium">{item}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(item)}
                  className="h-6 w-6 p-0 hover:bg-red-100"
                >
                  <X className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No {label.toLowerCase()} added yet</p>
            <p className="text-xs text-gray-400 mt-1">Add one using the input above</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader className="border-b pb-4">
          <div className="flex flex-col w-full">
            <DialogTitle className="text-2xl font-bold">Settings</DialogTitle>
            <DialogDescription className="text-base mt-1">
              Manage items, locations, departments, and import data.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'items'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Items
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'locations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Locations
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'departments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'password'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Change Password
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ml-auto ${
              activeTab === 'import'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Import/Export
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-6 max-h-[400px] overflow-y-auto">
          {activeTab === 'items' && renderCategoryContent('items')}

          {activeTab === 'locations' && renderCategoryContent('locations')}

          {activeTab === 'departments' && renderCategoryContent('departments')}

          {activeTab === 'password' && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Change Password</h3>
                <p className="text-sm text-gray-600 mb-4">
                  For security, enter your current password to set a new one.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      disabled={isChangingPassword}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      disabled={isChangingPassword}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      disabled={isChangingPassword}
                    />
                  </div>

                  {passwordMessage && (
                    <p
                      className={`text-sm font-medium ${
                        passwordMessage === 'Password updated successfully!'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {passwordMessage}
                    </p>
                  )}

                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      className="gap-2"
                    >
                      {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Import Data
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Import items, locations, and departments from a CSV file. Format: category,value (e.g., item,Printer)
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleImportExcel}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Template
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Download a template CSV file to use as a reference for importing data.
                </p>
                <Button
                  onClick={handleExportTemplate}
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </Button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">CSV Format Example</h3>
                <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
{`item,EPSON PRINTER (L5190)
item,HP PRINTER
location,4th Floor Conference Room 1
location,3rd Floor Office
department,IT Department
department,HR Department`}
                </pre>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div>
              {successMessage && (
                <p className="text-sm text-green-600 font-medium">{successMessage}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                Reset to None
              </Button>
              <Button
                type="button"
                onClick={handleSave}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
