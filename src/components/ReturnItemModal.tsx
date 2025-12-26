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

interface ReturnItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (returnedBy: string) => void
  itemName: string
  borrowerName: string
}

export default function ReturnItemModal({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  borrowerName,
}: ReturnItemModalProps) {
  const [returnedBy, setReturnedBy] = useState(borrowerName)
  const [error, setError] = useState('')

  // Update returnedBy when modal opens with borrowerName as default
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setReturnedBy(borrowerName)
      setError('')
    } else {
      setReturnedBy(borrowerName)
      setError('')
    }
    onOpenChange(newOpen)
  }

  const handleConfirm = () => {
    if (!returnedBy.trim()) {
      setError('Please enter who returned the item')
      return
    }

    onConfirm(returnedBy.trim())
    setReturnedBy(borrowerName)
    setError('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Return Item</DialogTitle>
          <DialogDescription>
            Confirm the return of: <span className="font-semibold text-gray-900">{itemName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="returnedBy">Returned by *</Label>
            <Input
              id="returnedBy"
              placeholder="Enter name of person returning the item"
              value={returnedBy}
              onChange={(e) => {
                setReturnedBy(e.target.value)
                setError('')
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm()
                }
              }}
              className={error ? 'border-red-500' : ''}
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          >
            Confirm Return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
