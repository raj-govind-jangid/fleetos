import { NavLink } from 'react-router-dom';
import {
  Bell,
  Car,
  ClipboardList,
  FileText,
  Fuel,
  LayoutDashboard,
  Settings,
  Users,
  Wrench,
  Wallet,
  Route,
  BarChart3,
  Building2,
  UserCircle,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Fleet',
    items: [
      { to: '/vehicles', label: 'Vehicles', icon: Car },
      { to: '/drivers', label: 'Drivers', icon: Users },
      { to: '/trips', label: 'Trips', icon: Route },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/fuel', label: 'Fuel', icon: Fuel },
      { to: '/maintenance', label: 'Maintenance', icon: Wrench },
      { to: '/expenses', label: 'Expenses', icon: Wallet },
    ],
  },
  {
    items: [
      { to: '/documents', label: 'Documents', icon: FileText },
      { to: '/alerts', label: 'Alerts', icon: Bell },
      { to: '/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    title: 'Settings',
    items: [
      { to: '/settings/profile', label: 'My Profile', icon: UserCircle },
      { to: '/settings/users', label: 'Users', icon: ClipboardList },
      { to: '/settings/organization', label: 'Organization', icon: Building2 },
    ],
  },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          aria-label="Close sidebar"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-0 lg:z-40 lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-sm font-bold text-white">
              F
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">FleetOS</span>
          </div>
          <button
            type="button"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section, idx) => (
            <div key={section.title ?? `section-${idx}`} className="mb-4">
              {section.title && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-200 px-4 py-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Settings className="h-3.5 w-3.5" />
            Fleet management platform
          </div>
        </div>
      </aside>
    </>
  );
}
