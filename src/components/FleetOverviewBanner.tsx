import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Search,
  Filter,
  Car,
  ShieldCheck
} from 'lucide-react';
import { formatVND } from '../utils/maintenanceEngine';

interface FleetOverviewBannerProps {
  analytics: {
    totalVehicles: number;
    overdueCount: number;
    urgentCount: number;
    dueSoonCount: number;
    normalCount: number;
    totalNextServiceCost: number;
    totalEst30DayCost: number;
    totalEst90DayCost: number;
  };
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: 'all' | 'due' | 'safe';
  setStatusFilter: (filter: 'all' | 'due' | 'safe') => void;
  viewMode?: 'table' | 'cards';
  setViewMode?: (mode: 'table' | 'cards') => void;
}

export const FleetOverviewBanner: React.FC<FleetOverviewBannerProps> = ({
  analytics,
  selectedBrand,
  setSelectedBrand,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  viewMode = 'table',
  setViewMode
}) => {
  const brands = ['Tất cả', 'Mercedes-Benz', 'Ford', 'Kia', 'Hyundai'];
  const dueTotal = analytics.urgentCount + analytics.dueSoonCount + analytics.overdueCount;
  const isAllSafe = dueTotal === 0;

  return (
    <div className="space-y-4">
      {/* 4 Professional Polish KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Tổng số xe */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Tổng số xe</p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
              {String(analytics.totalVehicles).padStart(2, '0')}
            </p>
            <span className="text-xs text-slate-400 font-medium">6 dòng xe chính</span>
          </div>
        </div>

        {/* Card 2: Sắp đến hạn */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Sắp đến hạn (7-14 ngày)</p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className={`text-2xl sm:text-3xl font-bold font-mono ${dueTotal > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {String(dueTotal).padStart(2, '0')}
            </p>
            {dueTotal > 0 ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {analytics.overdueCount > 0 ? `${analytics.overdueCount} quá hạn` : 'Cần chú ý'}
              </span>
            ) : (
              <span className="text-xs text-slate-400">0 xe quá hạn</span>
            )}
          </div>
        </div>

        {/* Card 3: Tổng chi phí dự kiến */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Tổng chi phí dự kiến</p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {analytics.totalNextServiceCost.toLocaleString('vi-VN')} <span className="text-xs text-slate-400 font-normal">VND</span>
            </p>
          </div>
        </div>

        {/* Card 4: Trạng thái đội xe */}
        <div className={`p-4 sm:p-5 rounded-xl border shadow-sm flex flex-col justify-between ${
          isAllSafe 
            ? 'bg-green-50 border-green-100' 
            : dueTotal >= 2 
            ? 'bg-amber-50/70 border-amber-200' 
            : 'bg-emerald-50 border-emerald-100'
        }`}>
          <p className={`text-xs uppercase font-bold tracking-wider ${
            isAllSafe ? 'text-green-600' : dueTotal >= 2 ? 'text-amber-700' : 'text-emerald-600'
          }`}>
            Trạng thái đội xe
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className={`text-2xl sm:text-3xl font-bold ${
              isAllSafe ? 'text-green-700' : dueTotal >= 2 ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              {analytics.overdueCount > 0 ? 'Cảnh Báo ODO' : dueTotal > 0 ? 'Cần Bảo Dưỡng' : 'An Toàn'}
            </p>
            <ShieldCheck className={`w-5 h-5 ${isAllSafe ? 'text-green-600' : 'text-amber-600'}`} />
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Brand tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold uppercase text-slate-400 mr-1 hidden md:inline px-1">
            Hãng xe:
          </span>
          {brands.map(brand => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedBrand === brand
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* Search and View Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* Status Filter buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('due')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                statusFilter === 'due'
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-amber-700'
              }`}
            >
              Cần bảo dưỡng
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm xe, biển số, mã..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
