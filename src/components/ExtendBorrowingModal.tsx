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
import { Calendar } from 'lucide-react'

interface ExtendBorrowingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (newDueDate: string) => void
  currentDueDate: string
  itemName: string
}

export default function ExtendBorrowingModal({
  open,
  onOpenChange,
  onConfirm,
  currentDueDate,
  itemName,
}: ExtendBorrowingModalProps) {
  const [newDueDate, setNewDueDate] = useState('')
  const [error, setError] = useState('')

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setNewDueDate('')
      setError('')
    }
    onOpenChange(isOpen)
  }

  const handleConfirm = () => {
    setError('')

    if (!newDueDate) {
      setError('Please select a new due date')
      return
    }

    const currentDate = new Date(currentDueDate)
    const selectedDate = new Date(newDueDate)

    if (selectedDate <= currentDate) {
      setError('New due date must be after the current due date')
      return
    }

    onConfirm(newDueDate)
    setNewDueDate('')
    setError('')
    handleOpenChange(false)
  }

  // Calculate minimum date (current due date + 1 day)
  const minDate = new Date(currentDueDate)
  minDate.setDate(minDate.getDate() + 1)
  const minDateString = minDate.toISOString().split('T')[0]

  // Calculate suggested date (current due date + 7 days)
  const suggestedDate = new Date(currentDueDate)
  suggestedDate.setDate(suggestedDate.getDate() + 7)
  const suggestedDateString = suggestedDate.toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Extend Borrowing Period</DialogTitle>
          <DialogDescription>
            Extend the due date for <span className="font-semibold text-foreground">{itemName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Due Date */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Current Due Date</span>
            </div>
            <p className="text-lg font-semibold text-blue-700">
              {new Date(currentDueDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* New Due Date Input */}
          <div className="space-y-2">
            <Label htmlFor="newDueDate">New Due Date *</Label>
            <Input
              id="newDueDate"
              type="date"
              value={newDueDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setNewDueDate(e.target.value)
                setError('')
              }}
              min={minDateString}
              className={error ? 'border-red-500' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Must be after {new Date(currentDueDate).toLocaleDateString()}
            </p>
          </div>

          {/* Quick Extend Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Quick Extend Options</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const date = new Date(currentDueDate)
                  date.setDate(date.getDate() + 3)
                  setNewDueDate(date.toISOString().split('T')[0])
                  setError('')
                }}
              >
                +3 Days
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewDueDate(suggestedDateString)
                  setError('')
                }}
              >
                +7 Days
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const date = new Date(currentDueDate)
                  date.setDate(date.getDate() + 14)
                  setNewDueDate(date.toISOString().split('T')[0])
                  setError('')
                }}
              >
                +14 Days
              </Button>
            </div>
          </div>

          {/* Preview */}
          {newDueDate && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">New Due Date</span>
              </div>
              <p className="text-lg font-semibold text-green-700">
                {new Date(newDueDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-xs text-green-600 mt-2">
                Extended by {Math.floor((new Date(newDueDate).getTime() - new Date(currentDueDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!newDueDate}
          >
            Confirm Extension
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
