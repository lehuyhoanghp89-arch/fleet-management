import React from 'react';
import { 
  Gauge, 
  CalendarClock, 
  DollarSign, 
  Sparkles, 
  FileSpreadsheet, 
  PlusCircle, 
  RefreshCw,
  Menu,
  X,
  BookOpen,
  Car,
  Database,
  Lock,
  UserCheck
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { AppUser } from '../types';
import { getRoleBadgeDetails } from '../utils/authManager';

interface NavbarProps {
  currentTab: 'fleet' | 'calendar' | 'compliance' | 'specs' | 'budget' | 'manuals';
  setCurrentTab: (tab: 'fleet' | 'calendar' | 'compliance' | 'specs' | 'budget' | 'manuals') => void;
  onOpenOdoModal: () => void;
  onOpenAddVehicleModal: () => void;
  onOpenAiAdvisor: () => void;
  onOpenExportReport: () => void;
  onResetData: () => void;
  onOpenDatabaseModal?: () => void;
  vehiclesCount?: number;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  currentUser?: AppUser | null;
  onOpenAuthModal?: () => void;
  onOpenUserManagement?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenOdoModal,
  onOpenAddVehicleModal,
  onOpenAiAdvisor,
  onOpenExportReport,
  onResetData,
  onOpenDatabaseModal,
  vehiclesCount = 0,
  onToggleMobileMenu,
  isMobileMenuOpen,
  currentUser,
  onOpenAuthModal,
  onOpenUserManagement
}) => {
  const isConnectedToSupabase = isSupabaseConfigured();
  const roleDetails = currentUser ? getRoleBadgeDetails(currentUser.role) : null;

  const getPageTitle = () => {
    switch (currentTab) {
      case 'calendar':
        return 'Lịch Trình Vận Hành & Bảo Dưỡng';
      case 'compliance':
        return 'Quản Lý Đăng Kiểm & Bảo Hiểm Xe';
      case 'specs':
        return 'Hồ Sơ Kỹ Thuật Đội Xe';
      case 'budget':
        return 'Dự Toán Ngân Sách Bảo Dưỡng';
      case 'manuals':
        return 'Sổ Tay & Phụ Tùng OEM';
      default:
        return 'Dự Toán Bảo Dưỡng Đội Xe';
    }
  };

  const getMobileShortTitle = () => {
    switch (currentTab) {
      case 'calendar':
        return 'Lịch Bảo Dưỡng';
      case 'compliance':
        return 'Đăng Kiểm & BH';
      case 'specs':
        return 'Hồ Sơ Kỹ Thuật';
      case 'budget':
        return 'Dự Toán Chi Phí';
      case 'manuals':
        return 'Sổ Tay OEM';
      default:
        return 'Đội Xe ODO';
    }
  };

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-20">
      
      {/* Left: Mobile Menu button & Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <h1 className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 truncate">
            <span className="hidden sm:inline italic">{getPageTitle()}</span>
            <span className="sm:hidden">{getMobileShortTitle()}</span>
          </h1>
          <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
            {vehiclesCount} Xe
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {onOpenDatabaseModal && (
          <button
            onClick={onOpenDatabaseModal}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-semibold transition-colors ${
              isConnectedToSupabase
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Xem trạng thái kết nối Supabase Database hoặc lấy schema SQL"
          >
            <Database className={`w-3.5 h-3.5 ${isConnectedToSupabase ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span>{isConnectedToSupabase ? 'Supabase: Đã kết nối' : 'Cơ sở dữ liệu'}</span>
          </button>
        )}

        <button
          onClick={onOpenAiAdvisor}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors"
          title="Tư vấn phụ tùng và cấp bảo dưỡng bằng AI"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="hidden sm:inline">Cố Vấn AI</span>
          <span className="sm:hidden">AI</span>
        </button>

        <button
          onClick={onOpenExportReport}
          className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
          title="Xuất bảng kế hoạch bảo dưỡng Excel"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Xuất Báo Cáo</span>
        </button>

        <button
          onClick={onOpenOdoModal}
          className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-sm items-center gap-1.5 transition-colors"
        >
          <span>+ Nhập ODO</span>
        </button>

        {currentUser?.role === 'admin' && onOpenUserManagement && (
          <button
            onClick={onOpenUserManagement}
            className="hidden xl:flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors"
            title="Quản lý danh sách tài khoản & Đổi mật khẩu người dùng"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>QL Tài Khoản</span>
          </button>
        )}

        {onOpenAuthModal && (
          <button
            onClick={onOpenAuthModal}
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 border rounded-lg text-xs font-semibold transition-all ${
              currentUser
                ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 active:bg-slate-200 text-slate-800'
                : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700'
            }`}
            title="Quản lý tài khoản & phân quyền truy cập"
          >
            {currentUser ? (
              <>
                <span className="text-sm sm:text-base leading-none">{currentUser.avatar || '👤'}</span>
                <span className="hidden xl:inline max-w-[120px] truncate">{currentUser.fullName}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${roleDetails?.bg}`}>
                  {roleDetails?.label}
                </span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Đăng nhập</span>
                <span className="sm:hidden text-[11px]">Đ.Nhập</span>
              </>
            )}
          </button>
        )}
      </div>

    </header>
  );
};

