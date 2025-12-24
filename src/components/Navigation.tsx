'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  CpuChipIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CommandLineIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Sub-Agents', href: '/sub-agents', icon: CpuChipIcon },
  { name: 'Configuration', href: '/configuration', icon: CogIcon },
  { name: 'Monitoring', href: '/monitoring', icon: ChartBarIcon },
  { name: 'Global Commands', href: '/commands', icon: CommandLineIcon },
  { name: 'Documentation', href: '/docs', icon: DocumentTextIcon },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav>
      <div className="nav-container">
        <div className="flex items-center">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon">
              <span>C</span>
            </div>
            <span>Claude Preferences</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links hidden md:flex">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" style={{width: '16px', height: '16px'}} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition duration-150 ease-in-out"
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" style={{width: '24px', height: '24px'}} />
            ) : (
              <Bars3Icon className="h-6 w-6" style={{width: '24px', height: '24px'}} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="mobile-menu md:hidden">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`mobile-menu-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-5 h-5 flex-shrink-0" style={{width: '20px', height: '20px'}} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}