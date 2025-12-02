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
  borrower: string
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
    borrower: '',
    department: '',
    location: '',
    borrowDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })

  const [errors, setErrors] = useState<Partial<NewBorrowingData>>({})

  const allItems = defaultSettings?.customItems || []
  const allLocations = defaultSettings?.customLocations || []
  const allDepartments = defaultSettings?.customDepartments || []

  const validateForm = (): boolean => {
    const newErrors: Partial<NewBorrowingData> = {}

    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required'
    }
    if (!formData.borrower.trim()) {
      newErrors.borrower = 'Borrower name is required'
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required'
    }
    if (!formData.location.trim()) {
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
      onSubmit(formData)
      setFormData({
        itemName: '',
        borrower: '',
        department: '',
        location: '',
        borrowDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
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

          {/* Borrower Name */}
          <div className="space-y-2">
            <Label htmlFor="borrower">Borrower Name *</Label>
            <Input
              id="borrower"
              name="borrower"
              placeholder="e.g., John Doe"
              value={formData.borrower}
              onChange={handleInputChange}
              className={errors.borrower ? 'border-red-500' : ''}
            />
            {errors.borrower && (
              <p className="text-sm text-red-500">{errors.borrower}</p>
            )}
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
            <Select value={formData.location} onValueChange={(value: string) => {
              setFormData((prev) => ({ ...prev, location: value }))
              if (errors.location) {
                setErrors((prev) => ({ ...prev, location: undefined }))
              }
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {allLocations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
