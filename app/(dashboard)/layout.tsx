'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  Truck,
  Wallet,
  LogOut,
  Menu,
  X,
  Droplets,
  Bell,
  Search,
  ChevronDown,
  Package,
  Server
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { jwt, userRole, user, clearAuth, _hasHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only redirect once component mounted, hydration is confirmed to be finish, AND no jwt is found.
    if (mounted && _hasHydrated && !jwt) {
      router.push('/login');
    }
  }, [mounted, _hasHydrated, jwt, router]);

  if (!mounted || !_hasHydrated || !jwt) {
    return <div className="min-h-screen flex items-center justify-center bg-base text-ink">Loading...</div>;
  }

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  // Define navigation based on role
  let navItems: { name: string; href: string; icon: any }[] = [];
  switch (userRole) {
    case 'SIGMA_ADMIN':
      navItems = [
        { name: 'Dashboard', href: '/sigma-admin', icon: LayoutDashboard },
        { name: 'Cities / PMCs', href: '/sigma-admin/pmc', icon: Building2 },
        { name: 'Device Inventory', href: '/sigma-admin/devices', icon: Server },
      ];
      break;
    case 'PMC_ADMIN':
      navItems = [
        { name: 'Fleet Overview', href: '/pmc-admin', icon: LayoutDashboard },
        { name: 'Device Management', href: '/pmc-admin/devices', icon: Server },
      ];
      break;
    case 'CONTRACTOR':
      navItems = [
        { name: 'Fleet Operations', href: '/contractor', icon: Droplets },
        { name: 'Trucks', href: '/contractor/trucks', icon: Truck },
        { name: 'Orders', href: '/contractor/orders', icon: Package },
        { name: 'Wallet', href: '/contractor/wallet', icon: Wallet },
      ];
      break;
    default:
      navItems = [];
  }

  return (
    <div className="flex h-screen overflow-hidden bg-base font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 minimal-sidebar transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-edge-light">
          <div className="flex items-center gap-2.5">
             <div className="w-8 h-8 bg-brand rounded flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">S</span>
             </div>
             <span className="text-lg font-bold text-ink tracking-tight">Sigmatronics</span>
          </div>
          <button className="lg:hidden text-ink-muted" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4">
           <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Menu</p>
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                // If the href is the root dashboard path, use exact matching
                // Otherwise, use startsWith for sub-pages
                const isRootDashboard = item.href === '/sigma-admin' || item.href === '/pmc-admin' || item.href === '/contractor';
                const isActive = isRootDashboard 
                  ? pathname === item.href 
                  : pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium',
                      isActive
                        ? 'bg-brand-subtle text-brand'
                        : 'text-ink-secondary hover:bg-surface hover:text-ink'
                    )}
                  >
                    <item.icon className={clsx('w-4 h-4', isActive ? 'text-brand' : 'text-ink-disabled')} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
        </div>

        <div className="p-4 mt-auto border-t border-edge-light">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-ink-secondary hover:text-danger hover:bg-danger-subtle transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4 text-ink-disabled group-hover:text-danger" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header */}
        <header className="minimal-sidebar lg:border-b h-16 flex items-center justify-between px-6 shrink-0">
           <div className="flex items-center gap-4 flex-1">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg text-ink-muted hover:bg-surface">
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Search Bar - Minimal */}
              <div className="hidden md:flex items-center relative w-full max-w-md">
                 <Search className="w-4 h-4 absolute left-3 text-ink-disabled" />
                 <input 
                   type="text" 
                   placeholder="Search anything..." 
                   className="w-full pl-9 pr-4 py-2 bg-base border border-edge-light rounded-lg text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand focus:bg-surface transition-colors"
                 />
              </div>
           </div>

           <div className="flex items-center gap-4">
              <button className="relative p-2 text-ink-disabled hover:text-ink">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-surface"></span>
              </button>
              <div className="flex items-center gap-2 pl-4 border-l border-edge-light">
                 <div className="w-8 h-8 rounded-full bg-brand-subtle flex items-center justify-center text-brand font-bold text-sm">
                    {user?.name?.charAt(0) || userRole?.charAt(0) || 'U'}
                 </div>
                 <div className="hidden md:block">
                    <p className="text-sm font-medium text-ink">{user?.name || 'Administrator'}</p>
                    <p className="text-xs text-ink-muted">{userRole?.replace('_', ' ')}</p>
                 </div>
                 <ChevronDown className="w-4 h-4 text-ink-disabled ml-1" />
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-base">
          {children}
        </main>
      </div>
    </div>
  );
}
