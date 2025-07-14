import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, FileText, Menu, X, TrendingUp } from 'lucide-react'
import { useState } from 'react'

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'HOME', href: '/', icon: Home },
    { name: 'BLOG', href: '/blog', icon: BookOpen },
    { name: 'STOCK', href: '/stock-features', icon: TrendingUp },
    { name: 'ADMIN', href: '/admin', icon: FileText },
  ]

  // 检查当前路径是否匹配导航项
  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen relative z-10">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-white hover:text-gray-100 transition-colors">
                {/* <span className="bg-white text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Prose
                </span> */}
                <span className="ml-1">PennyProse</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-white/20">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            © 2025 Prose Blog. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
