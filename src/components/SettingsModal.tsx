import { useState, useEffect } from 'react'
import { saveDefaultSettings } from '@/services/firebaseService'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'

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

  // Sync settings when currentSettings prop changes (from Firebase reload)
  useEffect(() => {
    setSettings(currentSettings)
  }, [currentSettings])

  const allItems = [...PREDEFINED_ITEMS, ...settings.customItems]
  const allLocations = [...PREDEFINED_LOCATIONS, ...settings.customLocations]
  const allDepartments = [...PREDEFINED_DEPARTMENTS, ...settings.customDepartments]

  const handleAddAll = () => {
    let added = false

    if (newItem.trim() && !allItems.includes(newItem.trim())) {
      setSettings((prev) => ({
        ...prev,
        customItems: [...prev.customItems, newItem.trim()],
      }))
      setNewItem('')
      added = true
    }

    if (newLocation.trim() && !allLocations.includes(newLocation.trim())) {
      setSettings((prev) => ({
        ...prev,
        customLocations: [...prev.customLocations, newLocation.trim()],
      }))
      setNewLocation('')
      added = true
    }

    if (newDepartment.trim() && !allDepartments.includes(newDepartment.trim())) {
      setSettings((prev) => ({
        ...prev,
        customDepartments: [...prev.customDepartments, newDepartment.trim()],
      }))
      setNewDepartment('')
      added = true
    }

    if (added) {
      setSuccessMessage('Added successfully!')
      setTimeout(() => {
        setSuccessMessage('')
      }, 2000)
    }
  }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="border-b pb-4">
          <div className="flex flex-col w-full">
            <DialogTitle className="text-2xl font-bold">Settings</DialogTitle>
            <DialogDescription className="text-base mt-1">
              Configure default values for new borrowing records.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-6 max-h-[60vh] overflow-y-auto">
          {/* Default Item Name Section */}
          <div className="space-y-3 pb-6 border-b">
            <div>
              <Label htmlFor="defaultItemName" className="text-sm font-semibold text-gray-900">
                Default Item Name
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                This item will be pre-selected when creating new borrowing records.
              </p>
            </div>
            <Select
              value={settings.defaultItemName || '__none__'}
              onValueChange={(value: string) => {
                setSettings((prev) => ({ ...prev, defaultItemName: value === '__none__' ? '' : value }))
              }}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {allItems.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Add Custom Item */}
            <Input
              placeholder="Add custom item"
              value={newItem}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  handleAddAll()
                }
              }}
              onBlur={() => {
                if (newItem.trim() && !allItems.includes(newItem.trim())) {
                  setSettings((prev) => ({
                    ...prev,
                    customItems: [...prev.customItems, newItem.trim()],
                  }))
                  setNewItem('')
                }
              }}
              className="bg-gray-50"
            />

            {/* Custom Items List */}
            {settings.customItems.length > 0 && (
              <div className="space-y-2 mt-3 pt-3 border-t">
                <p className="text-xs font-semibold text-gray-700">Added Items:</p>
                <div className="space-y-2">
                  {settings.customItems.map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm"
                    >
                      <span className="text-gray-800">{item}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteItem(item)}
                        className="h-6 w-6 p-0 hover:bg-red-100"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Default Location Section */}
          <div className="space-y-3 pb-6 border-b">
            <div>
              <Label htmlFor="defaultLocation" className="text-sm font-semibold text-gray-900">
                Default Location
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                This location will be pre-selected when creating new borrowing records.
              </p>
            </div>
            <Select
              value={settings.defaultLocation || '__none__'}
              onValueChange={(value: string) => {
                setSettings((prev) => ({ ...prev, defaultLocation: value === '__none__' ? '' : value }))
              }}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {allLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Add Custom Location */}
            <Input
              placeholder="Add custom location"
              value={newLocation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLocation(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  handleAddAll()
                }
              }}
              onBlur={() => {
                if (newLocation.trim() && !allLocations.includes(newLocation.trim())) {
                  setSettings((prev) => ({
                    ...prev,
                    customLocations: [...prev.customLocations, newLocation.trim()],
                  }))
                  setNewLocation('')
                }
              }}
              className="bg-gray-50"
            />

            {/* Custom Locations List */}
            {settings.customLocations.length > 0 && (
              <div className="space-y-2 mt-3 pt-3 border-t">
                <p className="text-xs font-semibold text-gray-700">Added Locations:</p>
                <div className="space-y-2">
                  {settings.customLocations.map((location) => (
                    <div
                      key={location}
                      className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm"
                    >
                      <span className="text-gray-800">{location}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteLocation(location)}
                        className="h-6 w-6 p-0 hover:bg-red-100"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Default Department Section */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="defaultDepartment" className="text-sm font-semibold text-gray-900">
                Default Department
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                This department will be pre-selected when creating new borrowing records.
              </p>
            </div>
            <Select
              value={settings.defaultDepartment || '__none__'}
              onValueChange={(value: string) => {
                setSettings((prev) => ({ ...prev, defaultDepartment: value === '__none__' ? '' : value }))
              }}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {allDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Add Custom Department */}
            <Input
              placeholder="Add custom department"
              value={newDepartment}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDepartment(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  handleAddAll()
                }
              }}
              onBlur={() => {
                if (newDepartment.trim() && !allDepartments.includes(newDepartment.trim())) {
                  setSettings((prev) => ({
                    ...prev,
                    customDepartments: [...prev.customDepartments, newDepartment.trim()],
                  }))
                  setNewDepartment('')
                }
              }}
              className="bg-gray-50"
            />

            {/* Custom Departments List */}
            {settings.customDepartments.length > 0 && (
              <div className="space-y-2 mt-3 pt-3 border-t">
                <p className="text-xs font-semibold text-gray-700">Added Departments:</p>
                <div className="space-y-2">
                  {settings.customDepartments.map((department) => (
                    <div
                      key={department}
                      className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm"
                    >
                      <span className="text-gray-800">{department}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteDepartment(department)}
                        className="h-6 w-6 p-0 hover:bg-red-100"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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
