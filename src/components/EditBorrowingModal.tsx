import { useEffect, useMemo, useState } from 'react'
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

export interface EditBorrowingInitialData {
  itemName: string
  firstName: string
  lastName: string
  department: string
  location: string
  purpose: string
  borrowDate: string
  dueDate: string
}

export interface EditBorrowingUpdates {
  itemName: string
  firstName: string
  lastName: string
  department: string
  location: string
  purpose: string
  dueDate: string
}

interface EditBorrowingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: EditBorrowingInitialData | null
  onConfirm: (updates: EditBorrowingUpdates) => void
  defaultSettings?: DefaultSettings
}

export default function EditBorrowingModal({
  open,
  onOpenChange,
  initialData,
  onConfirm,
  defaultSettings,
}: EditBorrowingModalProps) {
  const allItems = defaultSettings?.customItems || []
  const allLocations = defaultSettings?.customLocations || []
  const allDepartments = defaultSettings?.customDepartments || []

  const initialLocationList = useMemo(() => {
    const loc = initialData?.location || ''
    return loc
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean)
  }, [initialData?.location])

  const [formData, setFormData] = useState<EditBorrowingInitialData>({
    itemName: '',
    firstName: '',
    lastName: '',
    department: '',
    location: '',
    purpose: '',
    borrowDate: '',
    dueDate: '',
  })

  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [errors, setErrors] = useState<Partial<EditBorrowingInitialData>>({})

  useEffect(() => {
    if (!initialData) return
    setFormData(initialData)
    setSelectedLocations(initialLocationList)
    setErrors({})
  }, [initialData, initialLocationList])

  const validateForm = (): boolean => {
    const newErrors: Partial<EditBorrowingInitialData> = {}

    if (!formData.itemName.trim()) newErrors.itemName = 'Item name is required'
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.department.trim()) newErrors.department = 'Department is required'
    if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required'
    if (selectedLocations.length === 0) newErrors.location = 'Location is required'
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required'
    if (formData.borrowDate && formData.dueDate && formData.borrowDate >= formData.dueDate) {
      newErrors.dueDate = 'Due date must be after borrow date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name as keyof EditBorrowingInitialData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!initialData) return

    if (!validateForm()) return

    onConfirm({
      itemName: formData.itemName,
      firstName: formData.firstName,
      lastName: formData.lastName,
      department: formData.department,
      location: selectedLocations.join(', '),
      purpose: formData.purpose,
      dueDate: formData.dueDate,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Borrowing Record</DialogTitle>
          <DialogDescription>
            Update the borrowing information. Borrow date is locked to keep record history consistent.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name *</Label>
            <Select
              value={formData.itemName}
              onValueChange={(value: string) => {
                setFormData((prev) => ({ ...prev, itemName: value }))
                if (errors.itemName) {
                  setErrors((prev) => ({ ...prev, itemName: undefined }))
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an item" />
              </SelectTrigger>
              <SelectContent>
                {allItems.map((item) => (
                  <SelectItem key={item.name} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.itemName && <p className="text-sm text-red-500">{errors.itemName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select
              value={formData.department}
              onValueChange={(value: string) => {
                setFormData((prev) => ({ ...prev, department: value }))
                if (errors.department) {
                  setErrors((prev) => ({ ...prev, department: undefined }))
                }
              }}
            >
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
            {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
          </div>

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
                        setSelectedLocations((prev) => prev.filter((l) => l !== loc))
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
            {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose *</Label>
            <Input
              id="purpose"
              name="purpose"
              placeholder="e.g., Office use, Project presentation, Training"
              value={formData.purpose}
              onChange={handleInputChange}
              className={errors.purpose ? 'border-red-500' : ''}
            />
            {errors.purpose && <p className="text-sm text-red-500">{errors.purpose}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="borrowDate">Borrow Date</Label>
              <Input id="borrowDate" name="borrowDate" type="date" value={formData.borrowDate} disabled />
            </div>
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
              {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
