import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  CalendarClock, 
  DollarSign, 
  BookOpen, 
  Sparkles, 
  FileSpreadsheet, 
  PlusCircle, 
  RefreshCw,
  Car,
  Layers,
  ChevronRight,
  ShieldCheck,
  Menu,
  X,
  Database,
  User,
  Lock,
  LogOut
} from 'lucide-react';
import { AppUser } from '../types';
import { getRoleBadgeDetails } from '../utils/authManager';

export interface SidebarProps {
  currentTab: 'fleet' | 'calendar' | 'compliance' | 'specs' | 'budget' | 'manuals';
  setCurrentTab: (tab: 'fleet' | 'calendar' | 'compliance' | 'specs' | 'budget' | 'manuals') => void;
  onOpenOdoModal: () => void;
  onOpenAddVehicleModal: () => void;
  onOpenAiAdvisor: () => void;
  onOpenExportReport: () => void;
  onResetData: () => void;
  onOpenDatabaseModal?: () => void;
  currentUser?: AppUser | null;
  onOpenAuthModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenOdoModal,
  onOpenAddVehicleModal,
  onOpenAiAdvisor,
  onOpenExportReport,
  onResetData,
  onOpenDatabaseModal,
  currentUser,
  onOpenAuthModal
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const roleDetails = currentUser ? getRoleBadgeDetails(currentUser.role) : null;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      setCurrentTime(`${timeStr} | ${dateStr}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <aside className="w-64 bg-[#0F172A] text-white flex flex-col shrink-0 border-r border-slate-800 z-20">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('fleet')}>
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-sm text-sm">
            FC
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>FleetCare</span>
              <span className="text-blue-400">Pro</span>
            </div>
            <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Chuẩn Hãng Đa Xe
            </p>
          </div>
        </div>
      </div>

      {/* Main Nav Section */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 pt-1">
          Hệ thống quản lý
        </div>

        {/* Tab 1: Tổng quan đội xe */}
        <button
          onClick={() => setCurrentTab('fleet')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'fleet'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Gauge className="w-5 h-5 shrink-0 text-blue-400" />
          <span className="text-left flex-1">Tổng quan đội xe</span>
        </button>

        {/* Tab 2: Lịch trình Calendar */}
        <button
          onClick={() => setCurrentTab('calendar')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'calendar'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <CalendarClock className="w-5 h-5 shrink-0 text-cyan-400" />
          <span className="text-left flex-1">Lịch trình Tháng / Năm</span>
        </button>

        {/* Tab 3: Đăng kiểm & Bảo hiểm */}
        <button
          onClick={() => setCurrentTab('compliance')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'compliance'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="text-left flex-1">Đăng kiểm & Bảo hiểm</span>
        </button>

        {/* Tab 4: Hồ sơ kỹ thuật toàn đội */}
        <button
          onClick={() => setCurrentTab('specs')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'specs'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Car className="w-5 h-5 shrink-0 text-amber-400" />
          <span className="text-left flex-1">Hồ sơ toàn đội xe</span>
        </button>

        {/* Tab 5: Lịch sử & Chi phí */}
        <button
          onClick={() => setCurrentTab('budget')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'budget'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <DollarSign className="w-5 h-5 shrink-0 text-purple-400" />
          <span className="text-left flex-1">Lịch sử & Chi phí</span>
        </button>

        {/* Tab 6: Sổ tay kỹ thuật hãng */}
        <button
          onClick={() => setCurrentTab('manuals')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'manuals'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <BookOpen className="w-5 h-5 shrink-0 text-rose-400" />
          <span className="text-left flex-1">Sổ tay kỹ thuật</span>
        </button>

        {/* Divider and Actions */}
        <div className="pt-4 mt-2 border-t border-slate-800/80">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
            Công cụ nghiệp vụ
          </div>

          <div className="space-y-1.5">
            <button
              onClick={onOpenOdoModal}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
            >
              <CalendarClock className="w-4 h-4 text-cyan-400" />
              <span>Nhập ODO hàng ngày</span>
            </button>

            <button
              onClick={onOpenAiAdvisor}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-indigo-300 hover:bg-indigo-950/50 hover:text-white rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Cố vấn kỹ thuật AI</span>
            </button>

            <button
              onClick={onOpenExportReport}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Xuất báo cáo dự toán</span>
            </button>

            <button
              onClick={onOpenAddVehicleModal}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-blue-400" />
              <span>Thêm phương tiện mới</span>
            </button>

            {onOpenDatabaseModal && (
              <button
                onClick={onOpenDatabaseModal}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-950/40 hover:text-white rounded-lg transition-colors"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Cấu hình Supabase & Deploy</span>
              </button>
            )}

            <button
              onClick={onResetData}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Nạp / Đặt lại dữ liệu</span>
            </button>
          </div>
        </div>

      </nav>

      {/* User & Auth Info box */}
      <div className="p-3.5 mt-auto border-t border-slate-800/80 space-y-2">
        {currentUser ? (
          <div 
            onClick={onOpenAuthModal}
            className="bg-slate-800/90 hover:bg-slate-800 rounded-xl p-2.5 border border-slate-700/80 cursor-pointer transition-colors group flex items-center justify-between"
            title="Bấm để đổi vai trò hoặc đăng xuất"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm shrink-0">
                {currentUser.avatar || '👤'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-200 truncate">{currentUser.fullName}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${roleDetails?.badge || 'bg-slate-600 text-white'}`}>
                    {roleDetails?.label || 'Chỉ xem'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">@{currentUser.username}</span>
                </div>
              </div>
            </div>
            <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 shrink-0" />
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Đăng nhập hệ thống</span>
          </button>
        )}

        <div className="bg-slate-900/60 rounded-lg p-2 border border-slate-800 text-center">
          <p className="text-[10px] text-slate-400">Thời gian hệ thống</p>
          <p className="text-xs font-mono text-slate-300 font-semibold">{currentTime || '14:30 | 24/05/2026'}</p>
        </div>
      </div>

    </aside>
  );
};
