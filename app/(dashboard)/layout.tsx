'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardDoubleArrowLeftRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { useHeaderStore } from '@/store/headerStore';
import TruckSearchModal from '@/components/TruckSearchModal';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<SvgIconProps>;
};

type NavSection = { label: string; items: NavItem[] };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { jwt, userRole, user, clearAuth, _hasHydrated } = useAuthStore();
  const { title: customTitle, subtitle: customSubtitle, category: customCategory } = useHeaderStore();

  const getHeaderInfo = () => {
    if (customTitle) {
      return {
        title: customTitle,
        subtitle: customSubtitle,
        category: customCategory,
      };
    }

    if (pathname === '/sigma-admin') {
      return {
        title: 'Platform Overview',
        subtitle: 'A comprehensive snapshot of your cities, infrastructure, and operations.',
        category: 'Platform',
      };
    }
    if (pathname === '/sigma-admin/pmc') {
      return {
        title: 'PMC Management',
        subtitle: 'Onboard, monitor and configure all registered cities and their administrators.',
        category: 'Platform → Cities',
      };
    }
    if (pathname === '/sigma-admin/devices') {
      return {
        title: 'Device Network',
        subtitle: 'Register and monitor master controllers and their slave sensors across all cities.',
        category: 'Platform → Devices',
      };
    }
    if (pathname === '/pmc-admin') {
      return {
        title: 'Contractor Management',
        subtitle: 'Onboard and oversee fleet contractors operating under this municipality.',
        category: 'Operations → Contractors',
      };
    }
    if (pathname === '/pmc-admin/devices') {
      return {
        title: 'Device Management',
        subtitle: 'Monitor and manage master and slave devices across all stations.',
        category: 'Operations → Devices',
      };
    }
    if (pathname.startsWith('/pmc-admin/devices/')) {
      return {
        title: 'Device Detail',
        subtitle: 'Monitor telemetry and connected slave sensors.',
        category: 'Operations → Devices → Detail',
      };
    }
    if (pathname === '/contractor') {
      return {
        title: 'Fleet Operations',
        subtitle: 'Real-time tanker dispatch, analytics, and financial oversight.',
        category: 'Operations → Dashboard',
      };
    }
    if (pathname === '/contractor/wallet') {
      return {
        title: 'Wallet',
        subtitle: 'Balance overview, reserved funds and full transaction history.',
        category: 'Finance → Wallet',
      };
    }
    if (pathname === '/contractor/trucks') {
      return {
        title: 'Tanker Fleet',
        subtitle: 'Register, monitor and manage tankers across your operations.',
        category: 'Operations → Tankers',
      };
    }
    if (pathname === '/contractor/orders') {
      return {
        title: 'Order History',
        subtitle: 'All filling tokens issued, with current status and final amount.',
        category: 'Operations → Orders',
      };
    }

    return {
      title: 'Water Management System',
      subtitle: 'Premium water logistics & automation platform.',
      category: 'Dashboard',
    };
  };

  const { title, subtitle, category } = getHeaderInfo();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== 'undefined' ? localStorage.getItem('sidebar:collapsed') : null;
    if (stored === '1') setSidebarCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    setSidebarCollapsed((c) => {
      const next = !c;
      if (typeof window !== 'undefined') localStorage.setItem('sidebar:collapsed', next ? '1' : '0');
      return next;
    });
  };

  useEffect(() => {
    if (mounted && _hasHydrated && !jwt) {
      router.push('/login');
    }
  }, [mounted, _hasHydrated, jwt, router]);

  if (!mounted || !_hasHydrated || !jwt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base text-ink">
        <div className="flex items-center gap-3">
          <span className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          <span className="text-sm text-ink-muted">Loading…</span>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  let sections: NavSection[] = [];
  switch (userRole) {
    case 'SIGMA_ADMIN':
      sections = [
        {
          label: 'Overview',
          items: [{ name: 'Dashboard', href: '/sigma-admin', icon: SpaceDashboardOutlinedIcon }],
        },
        {
          label: 'Management',
          items: [
            { name: 'Cities & PMCs', href: '/sigma-admin/pmc', icon: LocationCityOutlinedIcon },
            { name: 'Devices', href: '/sigma-admin/devices', icon: SensorsOutlinedIcon },
          ],
        },
      ];
      break;
    case 'PMC_ADMIN':
      sections = [
        {
          label: 'Overview',
          items: [{ name: 'Fleet Overview', href: '/pmc-admin', icon: InsightsOutlinedIcon }],
        },
        {
          label: 'Management',
          items: [{ name: 'Devices', href: '/pmc-admin/devices', icon: SensorsOutlinedIcon }],
        },
      ];
      break;
    case 'CONTRACTOR':
      sections = [
        {
          label: 'Overview',
          items: [
            { name: 'Fleet Operations', href: '/contractor', icon: SpaceDashboardOutlinedIcon },
          ],
        },
        {
          label: 'Operations',
          items: [
            { name: 'Trucks', href: '/contractor/trucks', icon: LocalShippingOutlinedIcon },
            { name: 'Orders', href: '/contractor/orders', icon: ReceiptLongOutlinedIcon },
            { name: 'Wallet', href: '/contractor/wallet', icon: AccountBalanceWalletOutlinedIcon },
          ],
        },
      ];
      break;
  }

  const roleLabels: Record<string, string> = {
    SIGMA_ADMIN: 'Platform Admin',
    PMC_ADMIN: 'City Admin',
    CONTRACTOR: 'Contractor',
  };
  const roleLabel = (userRole && roleLabels[userRole]) || userRole?.replace('_', ' ') || '';
  const displayName = user?.name || roleLabel || 'Account';

  const initials = displayName
    .split(' ')
    .map((s: string) => s.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isActive = (href: string) => {
    const isRoot = ['/sigma-admin', '/pmc-admin', '/contractor'].includes(href);
    return isRoot ? pathname === href : pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-base font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 border-r border-slate-800 transition-[transform,width] duration-300 ease-out lg:static lg:translate-x-0 flex flex-col',
          sidebarCollapsed ? 'w-64 lg:w-[72px]' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div
          className={clsx(
            'relative flex items-center h-16 border-b border-slate-800 shrink-0',
            sidebarCollapsed ? 'px-5 justify-between lg:px-3 lg:justify-center' : 'px-5 justify-between'
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 shrink-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-md flex items-center justify-center shadow-lg shadow-blue-900/40">
              <WaterDropOutlinedIcon sx={{ fontSize: 20, color: '#fff' }} />
            </div>
            <div className={clsx('flex flex-col leading-tight min-w-0', sidebarCollapsed && 'lg:hidden')}>
              <span className="text-[15px] font-bold text-white tracking-tight truncate">Sigmatronics</span>
              <span className="text-[10px] text-slate-500 tracking-wider uppercase">Water Automation</span>
            </div>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Floating collapse toggle (desktop) */}
        <button
          onClick={toggleCollapsed}
          className="hidden lg:flex absolute top-12 -right-3 z-10 w-6 h-6 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white shadow-md shadow-slate-900/40 transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <KeyboardDoubleArrowRightRoundedIcon sx={{ fontSize: 14 }} />
          ) : (
            <KeyboardDoubleArrowLeftRoundedIcon sx={{ fontSize: 14 }} />
          )}
        </button>

        {/* Nav */}
        <nav className={clsx('flex-1 py-4 overflow-y-auto overflow-x-hidden', sidebarCollapsed ? 'px-3 lg:px-2' : 'px-3')}>
          {sections.map((section, sIdx) => (
            <div key={section.label} className="mb-5 last:mb-0">
              <p
                className={clsx(
                  'px-2.5 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500',
                  sidebarCollapsed && 'lg:hidden'
                )}
              >
                {section.label}
              </p>
              {sidebarCollapsed && sIdx > 0 && (
                <div className="hidden lg:block mx-2 mb-2 h-px bg-slate-800" aria-hidden="true" />
              )}
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      title={sidebarCollapsed ? item.name : undefined}
                      aria-label={item.name}
                      className={clsx(
                        'group relative flex items-center rounded-md text-sm font-medium transition-colors',
                        sidebarCollapsed
                          ? 'gap-2.5 px-2.5 py-2 lg:gap-0 lg:mx-auto lg:w-10 lg:h-10 lg:p-0 lg:justify-center'
                          : 'gap-2.5 px-2.5 py-2',
                        active
                          ? 'bg-blue-500/10 text-white'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                      )}
                    >
                      {active && (
                        <span
                          className={clsx(
                            'absolute bg-blue-400',
                            sidebarCollapsed
                              ? 'left-0 top-1.5 bottom-1.5 w-0.5 rounded-r lg:left-auto lg:-right-2 lg:top-2 lg:bottom-2 lg:w-0.5 lg:rounded-l'
                              : 'left-0 top-1.5 bottom-1.5 w-0.5 rounded-r'
                          )}
                        />
                      )}
                      <Icon
                        sx={{ fontSize: 18 }}
                        className={active ? 'text-blue-300' : 'text-slate-500 group-hover:text-slate-300'}
                      />
                      <span className={clsx('flex-1 truncate', sidebarCollapsed && 'lg:hidden')}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User card */}
        <div className={clsx('border-t border-slate-800', sidebarCollapsed ? 'p-3 lg:p-2' : 'p-3')}>
          <div
            className={clsx(
              'bg-slate-800/60 rounded-md flex items-center',
              sidebarCollapsed
                ? 'p-2.5 gap-2.5 lg:p-0 lg:bg-transparent lg:justify-center'
                : 'p-2.5 gap-2.5'
            )}
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900"
                aria-hidden="true"
                title="Online"
              />
            </div>
            <div className={clsx('flex-1 min-w-0 leading-tight', sidebarCollapsed && 'lg:hidden')}>
              <p className="text-[13px] font-semibold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 truncate">{roleLabel}</p>
            </div>
            <button
              onClick={handleLogout}
              className={clsx(
                'p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0',
                sidebarCollapsed && 'lg:hidden'
              )}
              title="Logout"
              aria-label="Logout"
            >
              <LogoutRoundedIcon sx={{ fontSize: 16 }} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="topbar h-14 flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-ink-muted hover:bg-base hover:text-ink transition-colors shrink-0"
              aria-label="Open menu"
            >
              <MenuRoundedIcon sx={{ fontSize: 22 }} />
            </button>

            {/* Premium Header Content */}
            <div className="flex flex-col leading-tight min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-ink truncate tracking-tight">{title}</h1>
                {category && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-semibold text-ink-muted bg-base border border-edge-light rounded px-1.5 py-0.5 uppercase tracking-wider font-mono">
                    {category}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-[10px] text-ink-muted truncate hidden md:block mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {userRole === 'SIGMA_ADMIN' && (
              <button
                onClick={() => setSearchModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-ink-muted bg-surface border border-edge-light rounded-md hover:text-ink hover:border-brand/40 transition-colors mr-2"
                title="Global Truck Search"
              >
                <SearchRoundedIcon sx={{ fontSize: 16 }} />
                <span>Search trucks...</span>
              </button>
            )}

            <button
              className="relative p-2 text-ink-muted hover:text-ink hover:bg-base rounded-md transition-colors"
              title="Notifications"
            >
              <NotificationsNoneRoundedIcon sx={{ fontSize: 18 }} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full" />
            </button>

            <div className="h-6 w-px bg-edge-light mx-1.5" />

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((s) => !s)}
                className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-md hover:bg-base transition-colors"
              >
                <div className="w-7 h-7 rounded bg-gradient-to-br from-brand to-blue-700 flex items-center justify-center text-white font-bold text-[11px]">
                  {initials}
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-xs font-semibold text-ink">{displayName}</p>
                  <p className="text-[10px] text-ink-muted">{roleLabel}</p>
                </div>
                <KeyboardArrowDownRoundedIcon
                  sx={{ fontSize: 16 }}
                  className={clsx('text-ink-disabled transition-transform', userMenuOpen && 'rotate-180')}
                />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-surface border border-edge-light rounded-md shadow-lg shadow-slate-900/10 py-1 z-40 animate-fade-up">
                    <div className="px-3 py-2 border-b border-edge-light">
                      <p className="text-xs font-semibold text-ink truncate">{displayName}</p>
                      <p className="text-[10px] text-ink-muted truncate">{roleLabel}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink-secondary hover:bg-danger-subtle hover:text-danger transition-colors"
                    >
                      <LogoutRoundedIcon sx={{ fontSize: 16 }} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-5 md:py-6 bg-base">
          {children}
        </main>
      </div>

      <TruckSearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </div>
  );
}
