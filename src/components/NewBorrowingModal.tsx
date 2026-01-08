import { useState, useEffect } from 'react'
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
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ItemSetting {
  name: string
  imageUrl?: string
}

interface DefaultSettings {
  defaultItemName: string
  defaultLocation: string
  defaultDepartment: string
  customItems: ItemSetting[]
  customLocations: string[]
  customDepartments: string[]
}

interface NewBorrowingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: NewBorrowingData) => void
  defaultSettings?: DefaultSettings
  existingRecords?: Array<{
    itemName: string
    borrowDate: string
    status: 'active' | 'overdue' | 'returned'
  }>
}

export interface NewBorrowingData {
  itemName: string
  firstName: string
  lastName: string
  department: string
  location: string
  borrowDate: string
  dueDate: string
}

export default function NewBorrowingModal({
  open,
  onOpenChange,
  onSubmit,
  defaultSettings,
  existingRecords = [],
}: NewBorrowingModalProps) {
  const [formData, setFormData] = useState<NewBorrowingData>({
    itemName: '',
    firstName: '',
    lastName: '',
    department: '',
    location: '',
    borrowDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })

  const [selectedLocations, setSelectedLocations] = useState<string[]>([])

  const [errors, setErrors] = useState<Partial<NewBorrowingData>>({})

  const allItems = defaultSettings?.customItems || []
  const allLocations = defaultSettings?.customLocations || []
  const allDepartments = defaultSettings?.customDepartments || []

  // Compute items unavailable on the selected borrow date (already borrowed and not returned)
  const unavailableItemsForDate = new Set(
    existingRecords
      .filter((r) => (r.borrowDate || '').slice(0, 10) === formData.borrowDate && r.status !== 'returned')
      .map((r) => r.itemName)
  )

  // If current item becomes unavailable when date changes, clear selection and show error
  useEffect(() => {
    if (formData.itemName && unavailableItemsForDate.has(formData.itemName)) {
      setFormData((prev) => ({ ...prev, itemName: '' }))
      setErrors((prev) => ({ ...prev, itemName: 'This item is already borrowed on the selected date' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.borrowDate])

  const validateForm = (): boolean => {
    const newErrors: Partial<NewBorrowingData> = {}

    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required'
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required'
    }
    if (selectedLocations.length === 0) {
      newErrors.location = 'Location is required'
    }
    if (!formData.borrowDate) {
      newErrors.borrowDate = 'Borrow date is required'
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    }
    if (formData.borrowDate && formData.dueDate && formData.borrowDate >= formData.dueDate) {
      newErrors.dueDate = 'Due date must be after borrow date'
    }
    // Business rule: an item cannot be borrowed twice on the same date unless the previous is returned
    if (formData.itemName && unavailableItemsForDate.has(formData.itemName)) {
      newErrors.itemName = 'This item is already borrowed on the selected date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      const location = selectedLocations.join(', ')
      onSubmit({ ...formData, location })
      setFormData({
        itemName: '',
        firstName: '',
        lastName: '',
        department: '',
        location: '',
        borrowDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
      setSelectedLocations([])
      setErrors({})
      onOpenChange(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof NewBorrowingData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 flex flex-col">
        <div className="p-6 pb-4">
        <DialogHeader>
          <DialogTitle>Create New Borrowing Record</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new borrowing record.
          </DialogDescription>
        </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <form onSubmit={handleSubmit} className="space-y-4 pb-6">
          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name *</Label>
            <Select value={formData.itemName} onValueChange={(value: string) => {
              setFormData((prev) => ({ ...prev, itemName: value }))
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an item" />
              </SelectTrigger>
              <SelectContent>
                {allItems.map((item) => (
                  <SelectItem
                    key={item.name}
                    value={item.name}
                    disabled={unavailableItemsForDate.has(item.name)}
                  >
                    {item.name}
                    {unavailableItemsForDate.has(item.name) ? ' (Unavailable today)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.itemName && (
              <p className="text-sm text-red-500">{errors.itemName}</p>
            )}
          </div>

          {/* Borrower Name - First and Last */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="e.g., John"
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="e.g., Doe"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select value={formData.department} onValueChange={(value: string) => {
              setFormData((prev) => ({ ...prev, department: value }))
              if (errors.department) {
                setErrors((prev) => ({ ...prev, department: undefined }))
              }
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {allDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && (
              <p className="text-sm text-red-500">{errors.department}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <div className="rounded-md border border-input bg-transparent">
              {selectedLocations.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 border-b border-input">
                  {selectedLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setSelectedLocations((prev) => {
                          const next = prev.filter((l) => l !== loc)
                          setFormData((fd) => ({ ...fd, location: next.join(', ') }))
                          return next
                        })
                      }}
                      className="text-xs px-2 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
                      title="Remove"
                    >
                      {loc} <span className="ml-1">×</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="max-h-44 overflow-y-auto p-3 space-y-2">
                {allLocations.length > 0 ? (
                  allLocations.map((loc) => {
                    const checked = selectedLocations.includes(loc)
                    return (
                      <label key={loc} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(nextChecked) => {
                            setSelectedLocations((prev) => {
                              const isChecked = nextChecked === true
                              const next = isChecked
                                ? [...prev, loc]
                                : prev.filter((l) => l !== loc)
                              setFormData((fd) => ({ ...fd, location: next.join(', ') }))
                              if (errors.location) {
                                setErrors((prevErrors) => ({ ...prevErrors, location: undefined }))
                              }
                              return next
                            })
                          }}
                        />
                        <span className="text-gray-800">{loc}</span>
                      </label>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-500">No locations available. Add locations in Settings.</p>
                )}
              </div>
            </div>
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location}</p>
            )}
          </div>

          {/* Borrow Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="borrowDate">Borrow Date *</Label>
              <Input
                id="borrowDate"
                name="borrowDate"
                type="date"
                value={formData.borrowDate}
                onChange={handleInputChange}
                className={errors.borrowDate ? 'border-red-500' : ''}
              />
              {errors.borrowDate && (
                <p className="text-sm text-red-500">{errors.borrowDate}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
                className={errors.dueDate ? 'border-red-500' : ''}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate}</p>
              )}
            </div>
          </div>
          </form>
        </div>

        <DialogFooter className="shrink-0 bg-background border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} className="w-full sm:w-auto">
            Create Borrowing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
