import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, User, Target, Map, BookOpen, Brain,
  Compass, Bookmark, FileText, Calendar, Settings, LogOut,
  Menu, X, ChevronRight, Shield, Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';

const studentNav = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/roadmaps', label: 'Roadmaps', icon: Map },
  { path: '/learn', label: 'Learn', icon: BookOpen },
  { path: '/skills', label: 'Skills', icon: Brain },
  { path: '/opportunities', label: 'Opportunities', icon: Compass },
  { path: '/saved', label: 'Saved', icon: Bookmark },
  { path: '/applications', label: 'Applications', icon: FileText },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
];

const adminNav = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/opportunities', label: 'Opportunities', icon: Compass },
  { path: '/admin/resources', label: 'Resources', icon: BookOpen },
  { path: '/admin/roadmaps', label: 'Roadmaps', icon: Map },
  { path: '/admin/assessments', label: 'Assessments', icon: Brain },
  { path: '/admin/students', label: 'Students', icon: User },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAdmin ? adminNav : studentNav;

  return (
    <div className="min-h-screen bg-slate-50/60 flex text-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 lg:translate-x-0 shadow-sm',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-slate-900 group-hover:bg-blue-600 transition-colors rounded-xl flex items-center justify-center text-white shadow-subtle">
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              PATHFORGE
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {isAdmin && (
            <div className="px-3 mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 text-white shadow-subtle">
                <Shield className="w-3 h-3 text-blue-400" /> Admin Suite
              </span>
            </div>
          )}

          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' &&
                item.path !== '/admin' &&
                location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150',
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-extrabold shadow-subtle'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <item.icon
                  className={clsx(
                    'w-4 h-4 shrink-0',
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile & actions footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-subtle">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/profile"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-subtle"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" /> Profile
            </Link>
            <button
              onClick={logout}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl bg-white border border-rose-200 transition-colors shadow-subtle"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header bar */}
        <header className="h-16 flex items-center justify-between px-5 border-b border-slate-200/90 bg-white lg:px-8 shadow-subtle">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-700 p-1 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/dashboard"
                className="text-xs text-blue-600 hover:text-blue-700 font-bold bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition-all"
              >
                Switch to Student View →
              </Link>
            )}
            {!isAdmin && user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="text-xs text-slate-700 hover:text-slate-900 font-bold bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-all"
              >
                Switch to Admin Portal →
              </Link>
            )}
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 p-5 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
