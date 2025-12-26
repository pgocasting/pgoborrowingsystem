import { useState } from 'react'
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

interface DefaultSettings {
  defaultItemName: string
  defaultLocation: string
  defaultDepartment: string
  customItems: string[]
  customLocations: string[]
  customDepartments: string[]
}

interface NewBorrowingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: NewBorrowingData) => void
  defaultSettings?: DefaultSettings
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Borrowing Record</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new borrowing record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.itemName && (
              <p className="text-sm text-red-500">{errors.itemName}</p>
            )}
          </div>

          {/* Borrower Name - First and Last */}
          <div className="grid grid-cols-2 gap-3">
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
          <div className="grid grid-cols-2 gap-4">
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

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Create Borrowing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
