import { LogOut, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, organization, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {organization?.name ?? 'Organization'}
          </p>
          <p className="hidden text-xs text-slate-500 sm:block">Fleet operations console</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/settings/profile" className="hidden text-right sm:block hover:opacity-80">
          <p className="text-sm font-medium text-slate-900">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.role?.replaceAll('_', ' ')}</p>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void logout()}
          leftIcon={<LogOut className="h-4 w-4" />}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
