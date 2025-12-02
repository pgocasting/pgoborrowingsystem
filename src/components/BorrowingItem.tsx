import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, User, Clock } from 'lucide-react'
import ExtendBorrowingModal from './ExtendBorrowingModal'
import ReturnItemModal from './ReturnItemModal'

interface BorrowingItemProps {
  id: string
  itemName: string
  borrower: string
  department: string
  borrowDate: string
  dueDate: string
  location: string
  status: 'active' | 'overdue' | 'returned'
  returnedAt?: string
  returnedBy?: string
  onReturn?: (returnedBy: string) => void
  onExtend?: (newDueDate: string) => void
}

export default function BorrowingItem({
  id,
  itemName,
  borrower,
  department,
  borrowDate,
  dueDate,
  location,
  status,
  returnedAt,
  returnedBy,
  onReturn,
  onExtend,
}: BorrowingItemProps) {
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  const handleExtendConfirm = (newDueDate: string) => {
    // Call the parent's onExtend with the new date
    if (onExtend) {
      onExtend(newDueDate)
    }
  }

  const handleReturnConfirm = (returnedBy: string) => {
    // Call the parent's onReturn with the person who returned it
    if (onReturn) {
      onReturn(returnedBy)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'returned':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const isOverdue = new Date(dueDate) < new Date() && status === 'active'

  return (
    <div
      onClick={() => {
        if (status === 'returned') {
          setIsFlipped(!isFlipped)
        }
      }}
      className={`h-96 ${status === 'returned' ? 'cursor-pointer' : 'cursor-default'}`}
      style={{
        perspective: '1000px',
      }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front Side */}
        <div
          className="absolute w-full h-full"
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold">{itemName}</CardTitle>
                  <CardDescription className="text-xs mt-1">ID: {id}</CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {status !== 'returned' && (
                    <>
                      {onExtend && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            setIsExtendModalOpen(true)
                          }}
                          className="text-xs"
                        >
                          Extend
                        </Button>
                      )}
                      {onReturn && (
                        <Button
                          size="sm"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            setIsReturnModalOpen(true)
                          }}
                          className="text-xs"
                        >
                          Return
                        </Button>
                      )}
                    </>
                  )}
                  <Badge className={`${getStatusColor(status)} border-0 shrink-0`}>
                    {getStatusLabel(status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 pt-4">
              <div className={`${status === 'returned' && returnedAt ? 'grid grid-cols-2 gap-4' : ''}`}>
                {/* Left Column */}
                <div className="space-y-3">
                  {/* Borrower Info */}
                  <div className="flex items-start gap-3 text-sm">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <span className="text-muted-foreground text-xs">Borrower:</span>
                      <p className="font-medium">{borrower}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{department}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <span className="text-muted-foreground text-xs">Location:</span>
                      <p className="font-medium">{location}</p>
                    </div>
                  </div>

                  {/* Borrow Date */}
                  <div className="flex items-start gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <span className="text-muted-foreground text-xs">Borrowed:</span>
                      <p className="font-medium">{new Date(borrowDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-start gap-3 text-sm">
                    <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-muted-foreground'} mt-0.5 shrink-0`} />
                    <div>
                      <span className="text-muted-foreground text-xs">Due:</span>
                      <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                        {new Date(dueDate).toLocaleDateString()}
                        {isOverdue && <span className="ml-2 text-xs text-red-600">(Overdue)</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">

                  {/* Returned Date and Time */}
                  {status === 'returned' && returnedAt && (
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-muted-foreground text-xs">Returned:</span>
                          <p className="font-medium text-green-600">
                            {new Date(returnedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <Clock className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-muted-foreground text-xs">Time:</span>
                          <p className="font-medium text-green-600">
                            {new Date(returnedAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <User className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-muted-foreground text-xs">Returned by:</span>
                          <p className="font-medium text-green-600">{returnedBy || borrower}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

          </Card>
        </div>

        {/* Back Side */}
        <div
          className="absolute w-full h-full"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <Card className="h-full flex flex-col bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg font-bold">Item Details</CardTitle>
              <CardDescription className="text-xs mt-0.5">Click to flip back</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Item ID</p>
                    <p className="text-sm font-bold text-gray-900">{id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Item Name</p>
                    <p className="text-sm font-bold text-gray-900">{itemName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Borrower ID</p>
                    <p className="text-sm font-bold text-gray-900">{borrower}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Status</p>
                    <Badge className={`${getStatusColor(status)} border-0 text-xs font-semibold`}>
                      {getStatusLabel(status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Days Borrowed</p>
                    <p className="text-sm font-bold text-gray-900">
                      {Math.floor((new Date().getTime() - new Date(borrowDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <ExtendBorrowingModal
        open={isExtendModalOpen}
        onOpenChange={setIsExtendModalOpen}
        onConfirm={handleExtendConfirm}
        currentDueDate={dueDate}
        itemName={itemName}
      />

      <ReturnItemModal
        open={isReturnModalOpen}
        onOpenChange={setIsReturnModalOpen}
        onConfirm={handleReturnConfirm}
        itemName={itemName}
        borrowerName={borrower}
      />
    </div>
  )
}
