import { CheckCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ReturnSuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  returnedAt: string
  returnedBy: string
}

export default function ReturnSuccessModal({
  open,
  onOpenChange,
  itemName,
  returnedAt,
  returnedBy,
}: ReturnSuccessModalProps) {
  const returnDate = new Date(returnedAt)
  const formattedDate = returnDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = returnDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Item Returned Successfully!</DialogTitle>
          <DialogDescription className="text-center mt-2">
            The item has been marked as returned.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Item Name */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Item Name</p>
            <p className="text-lg font-semibold text-gray-900">{itemName}</p>
          </div>

          {/* Return Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Return Date</p>
              <p className="text-lg font-semibold text-gray-900">{formattedDate}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Return Time</p>
              <p className="text-lg font-semibold text-gray-900">{formattedTime}</p>
            </div>
          </div>

          {/* Returned By */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Returned by</p>
            <p className="text-lg font-semibold text-gray-900">{returnedBy}</p>
          </div>
        </div>

        <Button
          onClick={() => onOpenChange(false)}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  )
}
