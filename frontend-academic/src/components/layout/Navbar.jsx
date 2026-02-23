import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  AcademicCapIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

const Navbar = () => {
  const { user, logout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-white border-b border-secondary-200 sticky top-0 z-50 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-xl">
              <AcademicCapIcon className="h-6 w-6 text-white" />
            </div>
            <Link to="/" className="text-xl font-bold text-secondary-900">
              Academic<span className="text-primary-600">Twins</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-secondary-500 hover:text-primary-600 transition-colors rounded-lg hover:bg-secondary-100">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger"></span>
            </button>

            {/* Profile menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-secondary-900">{user?.username}</p>
                  <p className="text-xs text-secondary-500 capitalize">{user?.role}</p>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-secondary-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-md border border-secondary-100 py-2 animate-slide-down">
                  <Link
                    to="/profil"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <UserIcon className="h-4 w-4" />
                    Mon profil
                  </Link>
                  <Link
                    to="/parametres"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <Cog6ToothIcon className="h-4 w-4" />
                    Paramètres
                  </Link>
                  <hr className="my-2 border-secondary-100" />
                  <button
                    onClick={() => {
                      logout()
                      setShowMenu(false)
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar