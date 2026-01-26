import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, User, Clock } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import ExtendBorrowingModal from './ExtendBorrowingModal'
import ReturnItemModal from './ReturnItemModal'

interface BorrowingItemProps {
  id: string
  itemName: string
  itemImageUrl?: string
  firstName: string
  lastName: string
  department: string
  borrowDate: string
  dueDate: string
  location: string
  purpose: string
  status: 'active' | 'overdue' | 'returned'
  returnedAt?: string
  returnedBy?: string
  onReturn?: (returnedBy: string) => void
  onExtend?: (newDueDate: string) => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function BorrowingItem({
  id,
  itemName,
  itemImageUrl,
  firstName,
  lastName,
  department,
  borrowDate,
  dueDate,
  location,
  purpose,
  status,
  returnedAt,
  returnedBy,
  onReturn,
  onExtend,
  onEdit,
  onDelete,
}: BorrowingItemProps) {
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  const isMobile = useIsMobile()

  const isReturnedView = status === 'returned' && !!returnedAt

  const locationList = location
    .split(',')
    .map((l) => l.trim())
    .filter(Boolean)

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
  const overdueDays = isOverdue
    ? Math.ceil((Date.now() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Returned late detection and days count
  const wasReturnedLate =
    status === 'returned' && returnedAt ? new Date(returnedAt) > new Date(dueDate) : false
  const overdueReturnedDays = wasReturnedLate
    ? Math.ceil(
        (new Date(returnedAt as string).getTime() - new Date(dueDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0

  const frontCard = (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="pb-4 border-b">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            {itemImageUrl ? (
              <img
                src={itemImageUrl}
                alt={itemName}
                className="h-12 w-12 rounded object-cover border shrink-0"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : null}
            <div className="min-w-0">
              <CardTitle className="text-lg font-bold truncate">{itemName}</CardTitle>
              <CardDescription className="text-xs mt-1">ID: {id}</CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:shrink-0">
            {status !== 'returned' && (
              <>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation()
                      onEdit()
                    }}
                    className="text-xs"
                  >
                    Edit
                  </Button>
                )}
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
            {onDelete && status !== 'returned' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="text-xs"
              >
                Delete
              </Button>
            )}
            <Badge className={`${getStatusColor(status)} border-0 shrink-0`}>{getStatusLabel(status)}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-4 pb-8">
        {isReturnedView ? (
          <div className="grid grid-cols-2 sm:grid-cols-[1.35fr_1fr] gap-6">
            {/* Left Column (wider) */}
            <div className="space-y-4">
              {/* Borrower Info */}
              <div className="flex items-start gap-3 text-sm">
                <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground text-xs">Borrower:</span>
                  <p className="font-medium">{firstName} {lastName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{department}</p>
                </div>
              </div>

              {/* Purpose */}
              <div className="flex items-start gap-3 text-sm">
                <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground text-xs">Purpose:</span>
                  <p className="font-medium">{purpose}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground text-xs">Location:</span>
                  {locationList.length > 1 ? (
                    <div className="mt-1 space-y-1">
                      {locationList.map((loc) => (
                        <p key={loc} className="font-medium leading-tight">
                          {loc}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="font-medium">{location}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-2">
              {/* Borrowed */}
              <div className="flex items-start gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground text-xs">Borrowed:</span>
                  <p className="font-medium">{new Date(borrowDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Due */}
              <div className="flex items-start gap-3 text-sm">
                <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-muted-foreground'} mt-0.5 shrink-0`} />
                <div>
                  <span className="text-muted-foreground text-xs">Due:</span>
                  <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                    {new Date(dueDate).toLocaleDateString()}
                    {isOverdue && (
                      <span className="ml-2 text-xs text-red-600">
                        {overdueDays} {overdueDays === 1 ? 'day' : 'days'} overdue
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Returned Date and Time */}
              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-muted-foreground text-xs">Returned:</span>
                    <p className="font-medium text-green-600">{new Date(returnedAt).toLocaleDateString()}</p>
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
                    <p className="font-medium text-green-600">{returnedBy || `${firstName} ${lastName}`}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* First Row: Borrower Info and Location */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Borrower Info */}
              <div className="flex items-start gap-3 text-sm">
                <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground text-xs">Borrower:</span>
                  <p className="font-medium">{firstName} {lastName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{department}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground text-xs">Location:</span>
                  {locationList.length > 1 ? (
                    <div className="mt-1 space-y-1">
                      {locationList.map((loc) => (
                        <p key={loc} className="font-medium leading-tight">
                          {loc}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="font-medium">{location}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Second Row: Purpose */}
            <div className="flex items-start gap-3 text-sm">
              <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <span className="text-muted-foreground text-xs">Purpose:</span>
                <p className="font-medium">{purpose}</p>
              </div>
            </div>

            {/* Third Row: Borrowed and Due - Always Side by Side */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Borrow Date */}
              <div className="flex items-start gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground text-xs">Borrowed:</span>
                  <p className="font-medium">{new Date(borrowDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Due Date (returned view) */}
              <div className="flex items-start gap-3 text-sm">
                <Clock className={`w-4 h-4 ${wasReturnedLate ? 'text-red-500' : 'text-muted-foreground'} mt-0.5 shrink-0`} />
                <div>
                  <span className="text-muted-foreground text-xs">Due:</span>
                  <p className={`font-medium ${wasReturnedLate ? 'text-red-600' : ''}`}>
                    {new Date(dueDate).toLocaleDateString()}
                    {wasReturnedLate && (
                      <span className="ml-2 text-xs text-red-600">
                        {overdueReturnedDays} {overdueReturnedDays === 1 ? 'day' : 'days'} overdue
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const backCard = (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col bg-white">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-start gap-3 justify-between">
          <div className="flex items-start gap-3">
          {itemImageUrl ? (
            <img
              src={itemImageUrl}
              alt={itemName}
              className="h-10 w-10 rounded object-cover border shrink-0"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : null}
          <div>
            <CardTitle className="text-lg font-bold">Item Details</CardTitle>
            <CardDescription className="text-xs mt-0.5">Tap to flip back</CardDescription>
          </div>
          </div>
          {onDelete && status === 'returned' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onDelete()
              }}
              className="text-xs"
            >
              Delete
            </Button>
          )}
        </div>
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
              <p className="text-xs text-muted-foreground font-medium mb-1">Borrower Name</p>
              <p className="text-sm font-bold text-gray-900">{firstName} {lastName}</p>
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
  )

  return (
    <div
      onMouseEnter={() => {
        if (status === 'returned' && !isMobile) {
          setIsFlipped(true)
        }
      }}
      onMouseLeave={() => {
        if (status === 'returned' && !isMobile) {
          setIsFlipped(false)
        }
      }}
      className={`min-h-104 sm:h-104 cursor-default`}
      style={{
        perspective: '1000px',
      }}
    >
      {isMobile ? (
        <>
          {status === 'returned' ? (isFlipped ? backCard : frontCard) : frontCard}

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
            borrowerName={`${firstName} ${lastName}`}
          />
        </>
      ) : (
        <>
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
              {frontCard}
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
                  <div className="flex items-start gap-3 justify-between">
                    <div className="flex items-start gap-3">
                    {itemImageUrl ? (
                      <img
                        src={itemImageUrl}
                        alt={itemName}
                        className="h-10 w-10 rounded object-cover border shrink-0"
                        onError={(e) => {
                          ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : null}
                    <div>
                      <CardTitle className="text-lg font-bold">Item Details</CardTitle>
                      <CardDescription className="text-xs mt-0.5">Click to flip back</CardDescription>
                    </div>
                    </div>
                    {onDelete && status === 'returned' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          onDelete()
                        }}
                        className="text-xs"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
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
                        <p className="text-xs text-muted-foreground font-medium mb-1">Borrower Name</p>
                        <p className="text-sm font-bold text-gray-900">{firstName} {lastName}</p>
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
                          {Math.floor(
                            (new Date().getTime() - new Date(borrowDate).getTime()) / (1000 * 60 * 60 * 24)
                          )}{' '}
                          days
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
            borrowerName={`${firstName} ${lastName}`}
          />
        </>
      )}
    </div>
  )
}
