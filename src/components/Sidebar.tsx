import { Menu, X, Home, Package, FileText, BarChart3, Archive, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SidebarProps {
  username: string
  isOpen: boolean
  onToggle: () => void
  activeTab?: string
  onTabChange?: (tab: string) => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
  onOpenNewBorrowing?: () => void
}

export default function Sidebar({ 
  username, 
  isOpen, 
  onToggle, 
  activeTab = 'dashboard',
  onTabChange,
  searchTerm,
  onSearchChange,
  onOpenNewBorrowing
}: SidebarProps) {
  const mainMenuItems = [
    { icon: Home, label: 'Dashboard', href: 'dashboard', action: () => onTabChange?.('dashboard') },
    { icon: Package, label: 'All Borrowings', href: 'borrowings', action: () => onTabChange?.('borrowings') },
    { icon: FileText, label: 'Active Items', href: 'active', action: () => onTabChange?.('active') },
    { icon: Archive, label: 'Returned Items', href: 'returned', action: () => onTabChange?.('returned') },
    { icon: BarChart3, label: 'Overdue Items', href: 'overdue', action: () => onTabChange?.('overdue') },
  ]


  const handleMenuClick = (item: any, e: React.MouseEvent) => {
    e.preventDefault()
    item.action()
    onToggle()
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:z-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo and Title */}
          <div className="p-6 border-b main-gradient-bg">
            <div className="flex items-center gap-3">
              <img
                src="/images/bataan-logo.png"
                alt="Bataan Logo"
                className="h-10 w-10 object-contain shrink-0"
              />
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white leading-tight">PGO Borrowing System</h2>
                <p className="text-sm text-white/90">Welcome, {username}</p>
              </div>
            </div>
          </div>

          {/* Search and New Borrowing */}
          <div className="p-4 border-b bg-gray-50 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => {
                onOpenNewBorrowing?.()
                onToggle()
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Borrowing
            </Button>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 p-4">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Main Menu</h3>
              <ul className="space-y-1">
                {mainMenuItems.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={(e) => handleMenuClick(item, e)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                        activeTab === item.href 
                          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </nav>

          {/* User Info */}
          <div className="p-4 border-t bg-gray-50">
            <div className="p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{username}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
