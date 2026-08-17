import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Wrench, 
  Shield, 
  FileCheck, 
  AlertTriangle, 
  Car, 
  Filter, 
  Clock, 
  DollarSign, 
  Info,
  CalendarDays,
  Grid,
  BarChart3,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Vehicle } from '../types';
import { calculateVehicleMilestones, formatVND } from '../utils/maintenanceEngine';

interface FleetCalendarViewProps {
  vehicles: Vehicle[];
  onOpenVehicleDetail: (vehicle: Vehicle) => void;
  onOpenComplianceModal: (vehicle: Vehicle) => void;
  onOpenOdoModal: (vehicle: Vehicle) => void;
}

interface CalendarEvent {
  id: string;
  vehicleId: string;
  vehicleCode: string;
  vehicleName: string;
  licensePlate: string;
  date: string; // YYYY-MM-DD
  type: 'maintenance' | 'inspection' | 'insurance_tnds' | 'insurance_body';
  title: string;
  subtitle: string;
  cost: number;
  badgeColor: string;
  vehicle: Vehicle;
}

export const FleetCalendarView: React.FC<FleetCalendarViewProps> = ({
  vehicles,
  onOpenVehicleDetail,
  onOpenComplianceModal,
  onOpenOdoModal,
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'year' | 'gantt'>('gantt');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026 baseline
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'maintenance' | 'inspection' | 'insurance'>('all');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [ganttRangeMonths, setGanttRangeMonths] = useState<number>(6); // 6 or 12 months in Gantt

  // Generate all calendar events from vehicles
  const events: CalendarEvent[] = [];

  vehicles.forEach(vehicle => {
    // 1. Maintenance event (next milestone and subsequent 3 milestones)
    const milestones = calculateVehicleMilestones(vehicle, [], 4);
    milestones.forEach((m, idx) => {
      if (m.estimatedDate) {
        events.push({
          id: `maint_${vehicle.id}_${m.targetOdo}`,
          vehicleId: vehicle.id,
          vehicleCode: vehicle.code,
          vehicleName: vehicle.name,
          licensePlate: vehicle.licensePlate,
          date: m.estimatedDate,
          type: 'maintenance',
          title: `Bảo dưỡng ${m.shortTier} (${m.targetOdo.toLocaleString('vi-VN')} km)`,
          subtitle: `${m.tierName} • Dự kiến ${m.daysRemaining} ngày nữa`,
          cost: m.estimatedCost,
          badgeColor: idx === 0 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 border border-blue-200',
          vehicle,
        });
      }
    });

    // 2. Inspection event
    if (vehicle.inspectionExpiryDate) {
      events.push({
        id: `insp_${vehicle.id}_${vehicle.inspectionExpiryDate}`,
        vehicleId: vehicle.id,
        vehicleCode: vehicle.code,
        vehicleName: vehicle.name,
        licensePlate: vehicle.licensePlate,
        date: vehicle.inspectionExpiryDate,
        type: 'inspection',
        title: 'Hạn Sổ Đăng Kiểm',
        subtitle: `${vehicle.inspectionStation || 'Trạm ĐK'} • Kiểm định & Phí đường bộ`,
        cost: vehicle.inspectionCost || 2500000,
        badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
        vehicle,
      });
    }

    // 3. TNDS Insurance event
    if (vehicle.tndsInsuranceExpiryDate) {
      events.push({
        id: `tnds_${vehicle.id}_${vehicle.tndsInsuranceExpiryDate}`,
        vehicleId: vehicle.id,
        vehicleCode: vehicle.code,
        vehicleName: vehicle.name,
        licensePlate: vehicle.licensePlate,
        date: vehicle.tndsInsuranceExpiryDate,
        type: 'insurance_tnds',
        title: 'Hạn BH Bắt Buộc TNDS',
        subtitle: `${vehicle.tndsInsuranceProvider || 'Nhà BH'} • Bắt buộc theo luật`,
        cost: vehicle.tndsInsuranceCost || 873000,
        badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
        vehicle,
      });
    }

    // 4. Body Insurance event
    if (vehicle.bodyInsuranceExpiryDate) {
      events.push({
        id: `body_${vehicle.id}_${vehicle.bodyInsuranceExpiryDate}`,
        vehicleId: vehicle.id,
        vehicleCode: vehicle.code,
        vehicleName: vehicle.name,
        licensePlate: vehicle.licensePlate,
        date: vehicle.bodyInsuranceExpiryDate,
        type: 'insurance_body',
        title: 'Hạn BH Thân Vỏ Tự Nguyện',
        subtitle: `${vehicle.bodyInsuranceProvider || 'Nhà BH'} • Bảo hiểm vật chất xe`,
        cost: vehicle.bodyInsuranceCost || 25000000,
        badgeColor: 'bg-purple-100 text-purple-900 border border-purple-300',
        vehicle,
      });
    }
  });

  // Filter events based on selections
  const filteredEvents = events.filter(e => {
    if (selectedVehicleId !== 'all' && e.vehicleId !== selectedVehicleId) return false;
    if (eventTypeFilter === 'maintenance' && e.type !== 'maintenance') return false;
    if (eventTypeFilter === 'inspection' && e.type !== 'inspection') return false;
    if (eventTypeFilter === 'insurance' && !e.type.startsWith('insurance')) return false;
    return true;
  });

  // Navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 7, 1)); // August 2026
  };

  // Month grid calculations
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Starting day index (0: Sun, 1: Mon, ... 6: Sat). We want Mon = 0, Sun = 6
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  const totalGridCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

  // Month events for the current month
  const currentMonthEvents = filteredEvents.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const monthBudget = currentMonthEvents.reduce((sum, e) => sum + e.cost, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner (#0F172A Professional Polish) */}
      <div className="p-6 bg-[#0F172A] text-white rounded-2xl border border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Lịch Trình Vận Hành, Bảo Dưỡng & Pháp Lý Đội Xe
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Trực quan hóa lịch trình theo Gantt Timeline, Lịch Tháng và Ma trận Cả Năm: Dự báo chính xác thời điểm xe cần vào xưởng bảo dưỡng, hạn đăng kiểm và gia hạn bảo hiểm.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center text-xs">
              <button
                onClick={() => setViewMode('gantt')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'gantt' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Timeline Gantt Chart</span>
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'month' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Xem Theo Tháng</span>
              </button>
              <button
                onClick={() => setViewMode('year')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'year' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Xem Cả Năm {year}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Controls & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Navigation & Title */}
        <div className="flex items-center space-x-3">
          {viewMode === 'gantt' ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setCurrentDate(new Date(year, month - 3, 1))}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
                  title="Lùi 3 tháng"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleToday}
                  className="px-3 py-1 text-xs font-bold text-slate-800 hover:bg-white rounded-lg transition-colors"
                >
                  Hôm nay
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(year, month + 3, 1))}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
                  title="Tiến 3 tháng"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Khung thời gian:</span>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                  <button
                    onClick={() => setGanttRangeMonths(6)}
                    className={`px-2.5 py-1 rounded font-bold transition-colors ${
                      ganttRangeMonths === 6 ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    6 Tháng
                  </button>
                  <button
                    onClick={() => setGanttRangeMonths(12)}
                    className={`px-2.5 py-1 rounded font-bold transition-colors ${
                      ganttRangeMonths === 12 ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    12 Tháng
                  </button>
                </div>
              </div>
            </div>
          ) : viewMode === 'month' ? (
            <>
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
                  title="Tháng trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleToday}
                  className="px-3 py-1 text-xs font-bold text-slate-800 hover:bg-white rounded-lg transition-colors"
                >
                  Hôm nay
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
                  title="Tháng sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 font-mono">
                Tháng {month + 1} / {year}
              </h3>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentDate(new Date(year - 1, 0, 1))}
                className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-black text-slate-900 font-mono">
                Năm {year}
              </h3>
              <button
                onClick={() => setCurrentDate(new Date(year + 1, 0, 1))}
                className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap text-xs">
          
          {/* Vehicle filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Car className="w-4 h-4 text-slate-500" />
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden"
            >
              <option value="all">Toàn bộ {vehicles.length} xe</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.code} - {v.name}</option>
              ))}
            </select>
          </div>

          {/* Event type pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setEventTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                eventTypeFilter === 'all' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả sự kiện
            </button>
            <button
              onClick={() => setEventTypeFilter('maintenance')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                eventTypeFilter === 'maintenance' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3 h-3" /> Bảo dưỡng
            </button>
            <button
              onClick={() => setEventTypeFilter('inspection')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                eventTypeFilter === 'inspection' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck className="w-3 h-3" /> Đăng kiểm
            </button>
            <button
              onClick={() => setEventTypeFilter('insurance')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                eventTypeFilter === 'insurance' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3 h-3" /> Bảo hiểm
            </button>
          </div>

        </div>

      </div>

      {/* VIEW 0: GANTT CHART TIMELINE */}
      {viewMode === 'gantt' && (() => {
        // Prepare timeline range
        const timelineStart = new Date(year, month, 1);
        const timelineMonths: Date[] = [];
        for (let i = 0; i < ganttRangeMonths; i++) {
          timelineMonths.push(new Date(year, month + i, 1));
        }

        const timelineEnd = new Date(year, month + ganttRangeMonths, 0);
        const totalTimelineDays = Math.max(1, (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));

        // Filter vehicles if single vehicle selected
        const displayVehicles = selectedVehicleId === 'all' 
          ? vehicles 
          : vehicles.filter(v => v.id === selectedVehicleId);

        // Today marker position
        const todayDate = new Date(2026, 7, 13);
        const todayOffsetDays = (todayDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
        const todayPercent = Math.min(100, Math.max(0, (todayOffsetDays / totalTimelineDays) * 100));
        const isTodayInView = todayOffsetDays >= 0 && todayOffsetDays <= totalTimelineDays;

        return (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
            
            {/* Gantt Top Summary Bar */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>Tiến Độ Lịch Trình ({displayVehicles.length} Phương Tiện)</span>
                </span>
                
                <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>

                <div className="flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block"></span>
                    <span className="font-medium">Bảo Dưỡng Cấp Hãng</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
                    <span className="font-medium">Hạn Đăng Kiểm</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
                    <span className="font-medium">BH Bắt Buộc TNDS</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block"></span>
                    <span className="font-medium">BH Thân Vỏ</span>
                  </span>
                </div>
              </div>

              <div className="text-slate-500 font-mono text-[11px]">
                Từ <strong className="text-slate-800">Tháng {month + 1}/{year}</strong> đến <strong className="text-slate-800">Tháng {((month + ganttRangeMonths - 1) % 12) + 1}/{year + Math.floor((month + ganttRangeMonths - 1) / 12)}</strong>
              </div>
            </div>

            {/* Scrollable Gantt Body */}
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                
                {/* Timeline Header Row (Months) */}
                <div className="flex border-b border-slate-200 bg-slate-100/90 text-xs font-bold text-slate-700 sticky top-0 z-10">
                  <div className="w-64 shrink-0 px-4 py-3 border-r border-slate-200 bg-slate-100 flex items-center justify-between">
                    <span>Phương Tiện & ODO</span>
                    <span className="text-[10px] font-normal text-slate-500">Chu kỳ</span>
                  </div>
                  
                  <div className="flex-1 flex relative">
                    {timelineMonths.map((m, idx) => (
                      <div 
                        key={idx} 
                        className="flex-1 py-2.5 px-2 text-center border-r border-slate-200/80 last:border-r-0"
                      >
                        <div className="font-mono text-xs text-slate-900">
                          Tháng {m.getMonth() + 1}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 font-normal">
                          {m.getFullYear()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehicle Rows */}
                <div className="divide-y divide-slate-100 relative">
                  
                  {/* Today Red Line Indicator across all rows */}
                  {isTodayInView && (
                    <div 
                      className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
                      style={{ left: `calc(16rem + (100% - 16rem) * ${todayPercent / 100})` }}
                    >
                      <div className="bg-red-500 text-white text-[9px] font-mono font-bold px-1 py-0.5 rounded shadow-xs whitespace-nowrap">
                        Hôm nay (13/08)
                      </div>
                      <div className="w-0.5 flex-1 bg-red-500/80 border-r border-red-300"></div>
                    </div>
                  )}

                  {displayVehicles.map(vehicle => {
                    // Get vehicle specific filtered events
                    const vehicleEvents = filteredEvents.filter(e => e.vehicleId === vehicle.id);

                    // Separate events into 3 distinct categories
                    const maintEvents = vehicleEvents.filter(e => e.type === 'maintenance');
                    const inspEvents = vehicleEvents.filter(e => e.type === 'inspection');
                    const insuEvents = vehicleEvents.filter(e => e.type.startsWith('insurance'));

                    // Helper renderer for event capsule on timeline
                    const renderEventCapsule = (event: CalendarEvent) => {
                      const evDate = new Date(event.date);
                      const evOffsetDays = (evDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
                      
                      if (evOffsetDays < -5 || evOffsetDays > totalTimelineDays + 5) {
                        return null;
                      }

                      const leftPercent = Math.max(1, Math.min(96, (evOffsetDays / totalTimelineDays) * 100));

                      return (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer z-10 transition-transform hover:scale-105 hover:z-30 group/node"
                          style={{ left: `${leftPercent}%` }}
                        >
                          {/* Event Card Capsule */}
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg shadow-xs border text-[11px] whitespace-nowrap transition-all hover:shadow-md ${
                            event.type === 'maintenance'
                              ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                              : event.type === 'inspection'
                              ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                              : event.type === 'insurance_tnds'
                              ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                              : 'bg-purple-600 text-white border-purple-700 hover:bg-purple-700'
                          }`}>
                            {event.type === 'maintenance' && <Wrench className="w-3 h-3 shrink-0" />}
                            {event.type === 'inspection' && <FileCheck className="w-3 h-3 shrink-0" />}
                            {event.type.startsWith('insurance') && <Shield className="w-3 h-3 shrink-0" />}
                            
                            <span className="font-bold">
                              {event.title.replace('Bảo dưỡng ', '')}
                            </span>
                            
                            <span className="font-mono text-[10px] bg-black/25 px-1.5 py-0.5 rounded ml-0.5">
                              {evDate.getDate()}/{evDate.getMonth() + 1}
                            </span>
                          </div>

                          {/* Hover Floating Tooltip with Quick Specs */}
                          <div className="hidden group-hover/node:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3 bg-slate-900 text-white rounded-xl shadow-xl z-50 text-left text-[11px] pointer-events-none">
                            <div className="font-bold text-amber-300 flex items-center justify-between">
                              <span>{event.title}</span>
                              <span className="font-mono text-[10px] text-slate-300">
                                {new Date(event.date).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <div className="text-slate-300 mt-1 text-[10px] leading-snug">{event.subtitle}</div>
                            <div className="mt-2 pt-2 border-t border-slate-700/80 flex items-center justify-between">
                              <span className="text-slate-400 text-[10px]">Dự toán chi phí:</span>
                              <span className="font-mono font-bold text-emerald-400 text-xs">
                                {formatVND(event.cost)}
                              </span>
                            </div>
                            <div className="text-[10px] text-blue-300 mt-1.5 pt-1 border-t border-slate-800 text-center font-medium">
                              Bấm vào để mở thao tác chi tiết
                            </div>
                          </div>

                        </div>
                      );
                    };

                    return (
                      <div key={vehicle.id} className="flex hover:bg-slate-50/50 transition-colors group">
                        
                        {/* Vehicle Left Info Card & 3 Sub-track Labels */}
                        <div className="w-72 shrink-0 border-r border-slate-200 bg-white group-hover:bg-slate-50/50 flex flex-col justify-between">
                          
                          {/* Top Vehicle Info Header */}
                          <div className="p-3 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-black text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                {vehicle.code}
                              </span>
                              <span className="font-mono text-xs font-bold text-slate-800">
                                {vehicle.licensePlate}
                              </span>
                            </div>
                            <div className="font-semibold text-xs text-slate-900 mt-1 truncate" title={vehicle.name}>
                              {vehicle.name}
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                              <span className="font-mono">
                                ODO: <strong className="text-slate-800">{(vehicle.currentOdo || 0).toLocaleString('vi-VN')}</strong> km
                              </span>
                              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                Chu kỳ: +{(vehicle.baseCycleKm || 10000).toLocaleString('vi-VN')} km
                              </span>
                            </div>
                          </div>

                          {/* 3 Sub-Lane Labels matching the rows exactly */}
                          <div className="divide-y divide-slate-100 text-[11px]">
                            {/* Sub-Lane 1: Bảo dưỡng */}
                            <div className="h-9 px-3 flex items-center justify-between text-slate-700 bg-slate-50/40">
                              <span className="flex items-center gap-1.5 font-semibold text-blue-800">
                                <Wrench className="w-3 h-3 text-blue-600 shrink-0" />
                                <span>Bảo Dưỡng Hãng</span>
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {maintEvents.length} mốc
                              </span>
                            </div>

                            {/* Sub-Lane 2: Đăng kiểm */}
                            <div className="h-9 px-3 flex items-center justify-between text-slate-700 bg-white">
                              <span className="flex items-center gap-1.5 font-semibold text-amber-800">
                                <FileCheck className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Hạn Đăng Kiểm</span>
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {inspEvents.length > 0 ? 'Có hạn' : '-'}
                              </span>
                            </div>

                            {/* Sub-Lane 3: Bảo hiểm */}
                            <div className="h-9 px-3 flex items-center justify-between text-slate-700 bg-slate-50/40">
                              <span className="flex items-center gap-1.5 font-semibold text-purple-800">
                                <Shield className="w-3 h-3 text-purple-600 shrink-0" />
                                <span>Bảo Hiểm Xe</span>
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {insuEvents.length} hợp đồng
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* Timeline Grid with 3 Distinct Horizontal Lanes */}
                        <div className="flex-1 relative flex flex-col justify-end">
                          
                          {/* Grid Background columns for each month spanning full height */}
                          <div className="absolute inset-0 flex pointer-events-none">
                            {timelineMonths.map((_, idx) => (
                              <div 
                                key={idx} 
                                className={`flex-1 border-r border-slate-100 last:border-r-0 ${
                                  idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/20'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Top Spacer matching Vehicle Info Header */}
                          <div className="h-[73px] border-b border-slate-100/80 relative flex items-center px-3 text-[11px] text-slate-400 bg-slate-50/10">
                            <span className="italic text-[10px]">
                              Tổng quan tiến độ & mốc sự kiện xe {vehicle.code} ({vehicle.licensePlate})
                            </span>
                          </div>

                          {/* 3 Dedicated Event Sub-Tracks */}
                          <div className="divide-y divide-slate-100 relative">
                            
                            {/* Track 1: Bảo Dưỡng Hãng */}
                            <div className="h-9 relative flex items-center px-1 bg-blue-50/10 hover:bg-blue-50/30 transition-colors">
                              {maintEvents.map(event => renderEventCapsule(event))}
                              {maintEvents.length === 0 && (
                                <span className="text-[10px] text-slate-300 italic pl-3 select-none">
                                  Không có mốc bảo dưỡng trong khung thời gian này
                                </span>
                              )}
                            </div>

                            {/* Track 2: Hạn Đăng Kiểm */}
                            <div className="h-9 relative flex items-center px-1 bg-amber-50/10 hover:bg-amber-50/30 transition-colors">
                              {inspEvents.map(event => renderEventCapsule(event))}
                              {inspEvents.length === 0 && (
                                <span className="text-[10px] text-slate-300 italic pl-3 select-none">
                                  Chưa đến kỳ đăng kiểm
                                </span>
                              )}
                            </div>

                            {/* Track 3: Bảo Hiểm (TNDS + Thân Vỏ) */}
                            <div className="h-9 relative flex items-center px-1 bg-purple-50/10 hover:bg-purple-50/30 transition-colors">
                              {insuEvents.map(event => renderEventCapsule(event))}
                              {insuEvents.length === 0 && (
                                <span className="text-[10px] text-slate-300 italic pl-3 select-none">
                                  Chưa đến hạn tái tục bảo hiểm
                                </span>
                              )}
                            </div>

                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Gantt Footer Guidance */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Đường màu đỏ đánh dấu <strong>ngày hiện tại</strong>. Nhấp trực tiếp vào bất kỳ sự kiện nào trên biểu đồ để xem chi tiết, cập nhật ODO hoặc thực hiện gia hạn.
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-500">Tổng chi phí dự kiến giai đoạn này:</span>
                <span className="font-mono font-extrabold text-blue-700 text-sm">
                  {formatVND(
                    filteredEvents
                      .filter(e => {
                        const d = new Date(e.date);
                        return d >= timelineStart && d <= timelineEnd;
                      })
                      .reduce((sum, e) => sum + e.cost, 0)
                  )}
                </span>
              </div>
            </div>

          </div>
        );
      })()}

      {/* VIEW 1: MONTH CALENDAR */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <div>Thứ 2</div>
            <div>Thứ 3</div>
            <div>Thứ 4</div>
            <div>Thứ 5</div>
            <div>Thứ 6</div>
            <div className="text-blue-600">Thứ 7</div>
            <div className="text-red-500">Chủ Nhật</div>
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 text-xs">
            {Array.from({ length: totalGridCells }).map((_, index) => {
              const dayNumber = index - startingDayOfWeek + 1;
              const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
              
              if (!isCurrentMonth) {
                return (
                  <div key={index} className="min-h-[110px] p-2 bg-slate-50/40 text-slate-300 select-none">
                    <span className="font-mono text-[11px]"></span>
                  </div>
                );
              }

              // Check events on this day
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
              const dayEvents = filteredEvents.filter(e => e.date === dateStr);
              const isToday = year === 2026 && month === 7 && dayNumber === 13; // Highlight today

              return (
                <div 
                  key={index} 
                  className={`min-h-[110px] p-2 transition-colors relative flex flex-col ${
                    isToday ? 'bg-blue-50/30' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                      isToday 
                        ? 'bg-blue-600 text-white shadow-2xs' 
                        : 'text-slate-800'
                    }`}>
                      {dayNumber}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {dayEvents.length} sự kiện
                      </span>
                    )}
                  </div>

                  {/* Event Badges list inside cell */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px] no-scrollbar">
                    {dayEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`w-full text-left p-1 rounded-md text-[10px] font-semibold border flex items-center justify-between gap-1 shadow-2xs transition-transform hover:scale-[1.02] cursor-pointer ${
                          event.type === 'maintenance'
                            ? 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                            : event.type === 'inspection'
                            ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                            : event.type === 'insurance_tnds'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                        }`}
                      >
                        <div className="truncate flex items-center gap-1">
                          {event.type === 'maintenance' && <Wrench className="w-2.5 h-2.5 text-blue-600 shrink-0" />}
                          {event.type === 'inspection' && <FileCheck className="w-2.5 h-2.5 text-amber-600 shrink-0" />}
                          {event.type.startsWith('insurance') && <Shield className="w-2.5 h-2.5 text-emerald-600 shrink-0" />}
                          <span className="font-mono font-extrabold">{event.vehicleCode}</span>
                          <span className="truncate">{event.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Month Summary Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-slate-600 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
                <span>Bảo dưỡng định kỳ ({currentMonthEvents.filter(e => e.type === 'maintenance').length})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
                <span>Đăng kiểm ({currentMonthEvents.filter(e => e.type === 'inspection').length})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                <span>Bảo hiểm TNDS / Thân vỏ ({currentMonthEvents.filter(e => e.type.startsWith('insurance')).length})</span>
              </span>
            </div>

            <div className="text-right">
              <span className="text-slate-500">Dự toán chi phí Tháng {month + 1}: </span>
              <span className="font-mono font-extrabold text-slate-900 text-sm">{formatVND(monthBudget)}</span>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: YEAR OVERVIEW (12 MONTHS MATRIX) */}
      {viewMode === 'year' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, mIndex) => {
              const monthEvents = filteredEvents.filter(e => {
                const d = new Date(e.date);
                return d.getFullYear() === year && d.getMonth() === mIndex;
              });

              const totalMonthCost = monthEvents.reduce((sum, e) => sum + e.cost, 0);
              const isCurrentMonth = mIndex === month;

              return (
                <div
                  key={mIndex}
                  className={`bg-white rounded-2xl border p-4 shadow-2xs flex flex-col justify-between transition-all ${
                    isCurrentMonth 
                      ? 'border-blue-500 ring-2 ring-blue-500/20' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900">
                          Tháng {mIndex + 1}
                        </span>
                        {isCurrentMonth && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
                            Hiện tại
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {monthEvents.length} mốc
                      </span>
                    </div>

                    {/* Events Mini List */}
                    <div className="space-y-1.5 min-h-[90px]">
                      {monthEvents.length === 0 ? (
                        <div className="text-[11px] text-slate-400 italic py-4 text-center">
                          Không có sự kiện
                        </div>
                      ) : (
                        monthEvents.slice(0, 3).map(ev => (
                          <div 
                            key={ev.id}
                            onClick={() => setSelectedEvent(ev)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] cursor-pointer flex items-center justify-between gap-2"
                          >
                            <div className="truncate flex items-center gap-1">
                              <span className="font-mono font-bold text-slate-900">{ev.vehicleCode}</span>
                              <span className="text-slate-600 truncate">{ev.title}</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-400 shrink-0">
                              {new Date(ev.date).getDate()}/{mIndex + 1}
                            </span>
                          </div>
                        ))
                      )}

                      {monthEvents.length > 3 && (
                        <div className="text-[10px] text-center text-slate-400 font-medium pt-1">
                          + {monthEvents.length - 3} sự kiện khác
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Month Budget & Switch Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
                    <span className="font-mono font-bold text-slate-900">
                      {formatVND(totalMonthCost)}
                    </span>
                    <button
                      onClick={() => {
                        setCurrentDate(new Date(year, mIndex, 1));
                        setViewMode('month');
                      }}
                      className="text-blue-600 hover:text-blue-800 font-bold text-[11px]"
                    >
                      Chi tiết &rarr;
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Modal when clicking an event */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`p-2 rounded-xl ${
                  selectedEvent.type === 'maintenance'
                    ? 'bg-blue-100 text-blue-700'
                    : selectedEvent.type === 'inspection'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {selectedEvent.type === 'maintenance' && <Wrench className="w-5 h-5" />}
                  {selectedEvent.type === 'inspection' && <FileCheck className="w-5 h-5" />}
                  {selectedEvent.type.startsWith('insurance') && <Shield className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedEvent.vehicleCode} • {selectedEvent.vehicleName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs text-slate-700">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Ngày dự kiến / Hạn:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {new Date(selectedEvent.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Chi tiết nội dung:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[200px]">
                  {selectedEvent.subtitle}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Dự toán ngân sách:</span>
                <span className="font-mono font-extrabold text-blue-700 text-base">
                  {formatVND(selectedEvent.cost)}
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Biển số & Tài xế:</span>
                <span className="font-medium text-slate-800">
                  {selectedEvent.licensePlate} ({selectedEvent.vehicle.driverName || 'Chưa gán'})
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  onOpenVehicleDetail(selectedEvent.vehicle);
                }}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Xem Hồ Sơ Xe
              </button>

              {selectedEvent.type === 'maintenance' ? (
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    onOpenOdoModal(selectedEvent.vehicle);
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                >
                  Cập Nhật ODO Mới
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    onOpenComplianceModal(selectedEvent.vehicle);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                >
                  Gia Hạn Ngay
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
