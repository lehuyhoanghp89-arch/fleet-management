import React from 'react';
import { 
  Car, 
  CalendarClock, 
  ShieldCheck, 
  DollarSign, 
  Gauge,
  Menu,
  Sparkles
} from 'lucide-react';
import { AppUser } from '../types';

interface MobileBottomNavProps {
  currentTab: 'fleet' | 'calendar' | 'compliance' | 'specs' | 'budget' | 'manuals';
  setCurrentTab: (tab: 'fleet' | 'calendar' | 'compliance' | 'specs' | 'budget' | 'manuals') => void;
  onOpenOdoModal: () => void;
  onToggleMobileMenu: () => void;
  currentUser?: AppUser | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenOdoModal,
  onToggleMobileMenu,
  currentUser
}) => {
  const navItems = [
    {
      id: 'fleet' as const,
      label: 'Đội Xe',
      icon: Car,
    },
    {
      id: 'calendar' as const,
      label: 'Lịch Trình',
      icon: CalendarClock,
    },
    // Center is the floating Action Button
    {
      id: 'compliance' as const,
      label: 'Đăng Kiểm',
      icon: ShieldCheck,
    },
    {
      id: 'budget' as const,
      label: 'Dự Toán',
      icon: DollarSign,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around relative">
        {/* Left 2 tabs */}
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                isActive 
                  ? 'text-blue-600 font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg transition-transform ${isActive ? 'bg-blue-50 scale-110' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Center Quick Action: Nhập ODO (+) Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onOpenOdoModal}
            className="flex flex-col items-center group active:scale-95 transition-transform"
            title="Nhập số KM ODO mới nhanh"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 border-2 border-white ring-2 ring-blue-100">
              <Gauge className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-blue-700 mt-1 whitespace-nowrap">
              + Nhập ODO
            </span>
          </button>
        </div>

        {/* Right 2 tabs */}
        {navItems.slice(2, 4).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                isActive 
                  ? 'text-blue-600 font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg transition-transform ${isActive ? 'bg-blue-50 scale-110' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Extra Menu button */}
        <button
          onClick={onToggleMobileMenu}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
            currentTab === 'specs' || currentTab === 'manuals'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="p-1 rounded-lg">
            <Menu className="w-5 h-5 text-slate-500" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
            Thêm
          </span>
        </button>
      </div>
    </div>
  );
};
