import { useState } from 'react'
import Link from 'next/link'

export default function CareMenuHeader() {
  type DropdownKey = 'solutions' | 'products' | 'resources'

  const [dropdowns, setDropdowns] = useState({
    solutions: false,
    products: false,
    resources: false,
  })

  const toggleDropdown = (menu: DropdownKey) => {
    setDropdowns(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }))
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-lg text-gray-900">CareMenu</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Solutions Dropdown */}
            <div className="relative group">
              <button
                onClick={() => toggleDropdown('solutions')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                Solutions
                <span className="ml-1">▼</span>
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link href="#compliance" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  HACCP Compliance
                </Link>
                <Link href="#waste" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  Waste Reduction
                </Link>
                <Link href="#cost" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  Cost Control
                </Link>
              </div>
            </div>

            {/* Products Dropdown */}
            <div className="relative group">
              <button
                onClick={() => toggleDropdown('products')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                Features
                <span className="ml-1">▼</span>
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link href="#inventory" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  Inventory Tracking
                </Link>
                <Link href="#compliance-tracker" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  Compliance Tracker
                </Link>
                <Link href="#reporting" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  Audit Reports
                </Link>
              </div>
            </div>

            {/* Resources Dropdown */}
            <div className="relative group">
              <button
                onClick={() => toggleDropdown('resources')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                Resources
                <span className="ml-1">▼</span>
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link href="#case-studies" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  Case Studies
                </Link>
                <Link href="#guides" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  HACCP Guides
                </Link>
                <Link href="#blog" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  Blog
                </Link>
              </div>
            </div>

            <Link href="#pricing" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
              Pricing
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">
              Login
            </Link>
            <Link href="#demo" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Book Demo
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
