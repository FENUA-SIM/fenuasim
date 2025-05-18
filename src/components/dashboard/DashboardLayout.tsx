import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Package, History, Activity, MessageSquare } from 'lucide-react';

interface NavItem {
  label: string;
  icon: ReactNode;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Mes forfaits', icon: <Package className="w-5 h-5" />, href: '/dashboard' },
  { label: 'Commandes', icon: <History className="w-5 h-5" />, href: '/dashboard/orders' },
  { label: 'Consommation', icon: <Activity className="w-5 h-5" />, href: '/dashboard/usage' },
  { label: 'Support', icon: <MessageSquare className="w-5 h-5" />, href: '/dashboard/support' },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <nav className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full ${
                router.pathname === item.href
                  ? 'text-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Navigation desktop */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-purple-600">FENUA SIM</h1>
        </div>
        <nav className="mt-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm ${
                router.pathname === item.href
                  ? 'bg-purple-50 text-purple-600 border-r-4 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Contenu principal */}
      <div className="lg:ml-64 pb-16 lg:pb-0">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 