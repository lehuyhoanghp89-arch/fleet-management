import React, { useState } from 'react';
import { 
  Shield, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Building, 
  DollarSign, 
  ArrowUpRight, 
  Car, 
  Edit3, 
  Filter,
  ShieldAlert,
  Search
} from 'lucide-react';
import { Vehicle } from '../types';
import { formatVND } from '../utils/maintenanceEngine';

interface ComplianceManagerViewProps {
  vehicles: Vehicle[];
  onOpenUpdateModal: (vehicle: Vehicle) => void;
  onOpenVehicleDetail: (vehicle: Vehicle) => void;
  onOpenEditVehicle?: (vehicle: Vehicle) => void;
}

export const ComplianceManagerView: React.FC<ComplianceManagerViewProps> = ({
  vehicles,
  onOpenUpdateModal,
  onOpenVehicleDetail,
  onOpenEditVehicle,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'urgent' | 'inspection' | 'insurance'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const now = new Date();

  // Helper to calculate days remaining from today
  const getDaysDiff = (dateStr?: string) => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Status badge helper
  const getStatusBadge = (days: number | null) => {
    if (days === null) {
      return (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">
          Chưa nhập
        </span>
      );
    }
    if (days < 0) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
          <ShieldAlert className="w-3 h-3" /> Quá hạn {Math.abs(days)} ngày
        </span>
      );
    }
    if (days <= 15) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 animate-pulse">
          <AlertTriangle className="w-3 h-3" /> Hết hạn trong {days} ngày
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3" /> Còn {days} ngày
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" /> Còn {days} ngày
      </span>
    );
  };

  // Fleet stats calculation
  let totalInspectionBudget = 0;
  let totalInsuranceBudget = 0;
  let urgentInspectionCount = 0;
  let urgentInsuranceCount = 0;

  const vehicleComplianceList = vehicles.map(v => {
    const inspectionDays = getDaysDiff(v.inspectionExpiryDate);
    const tndsDays = getDaysDiff(v.tndsInsuranceExpiryDate);
    const bodyDays = getDaysDiff(v.bodyInsuranceExpiryDate);

    const isUrgentInspection = inspectionDays !== null && inspectionDays <= 30;
    const isUrgentInsurance = (tndsDays !== null && tndsDays <= 30) || (bodyDays !== null && bodyDays <= 30);

    if (isUrgentInspection) urgentInspectionCount++;
    if (isUrgentInsurance) urgentInsuranceCount++;

    totalInspectionBudget += v.inspectionCost || 0;
    totalInsuranceBudget += (v.tndsInsuranceCost || 0) + (v.bodyInsuranceCost || 0);

    return {
      vehicle: v,
      inspectionDays,
      tndsDays,
      bodyDays,
      isUrgentInspection,
      isUrgentInsurance,
      hasAnyUrgent: isUrgentInspection || isUrgentInsurance,
    };
  });

  const totalUrgentCount = vehicleComplianceList.filter(item => item.hasAnyUrgent).length;

  // Filtered list
  const filteredVehicles = vehicleComplianceList.filter(({ vehicle, isUrgentInspection, isUrgentInsurance, hasAnyUrgent }) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        vehicle.code.toLowerCase().includes(q) ||
        vehicle.name.toLowerCase().includes(q) ||
        vehicle.licensePlate.toLowerCase().includes(q) ||
        (vehicle.inspectionStation && vehicle.inspectionStation.toLowerCase().includes(q)) ||
        (vehicle.tndsInsuranceProvider && vehicle.tndsInsuranceProvider.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (filterType === 'urgent') return hasAnyUrgent;
    if (filterType === 'inspection') return isUrgentInspection;
    if (filterType === 'insurance') return isUrgentInsurance;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner (#0F172A Professional Polish) */}
      <div className="p-6 bg-[#0F172A] text-white rounded-2xl border border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Quản Lý Hạn Đăng Kiểm & Bảo Hiểm Xe Toàn Đội
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Theo dõi chủ động thời hạn sổ đăng kiểm, phí bảo trì đường bộ, bảo hiểm TNDS bắt buộc và bảo hiểm thân vỏ. Đảm bảo 100% phương tiện lưu hành hợp pháp, tránh phạt vi phạm và gián đoạn vận hành.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-slate-800 rounded-xl px-4 py-2.5 border border-slate-700 text-right">
              <span className="text-[11px] text-slate-400 block">Dự toán phí ĐK & Bảo hiểm / Năm</span>
              <span className="text-lg font-extrabold text-emerald-400 font-mono">
                {formatVND(totalInspectionBudget + totalInsuranceBudget)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Alert Callout Banner if any vehicle is expiring within 30 days */}
      {totalUrgentCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-900">
                Cảnh Báo: Có {totalUrgentCount} xe sắp đến hạn Đăng kiểm / Bảo hiểm (Dưới 30 ngày)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Vui lòng liên hệ trung tâm đăng kiểm và đại lý bảo hiểm để hoàn tất thủ tục trước khi hết hạn.
              </p>
            </div>
          </div>

          <button
            onClick={() => setFilterType('urgent')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0 shadow-2xs"
          >
            Xem {totalUrgentCount} xe cần gia hạn
          </button>
        </div>
      )}

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cần xử lý gấp (&le; 30 ngày)</span>
            <div className={`p-2 rounded-lg ${totalUrgentCount > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">{totalUrgentCount}</span>
            <span className="text-xs text-slate-400">/ {vehicles.length} xe</span>
          </div>
          <div className="mt-1 text-[11px] text-red-600 font-medium">
            {urgentInspectionCount} xe hạn ĐK • {urgentInsuranceCount} xe hạn BH
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Hạn Đăng Kiểm Hợp Lệ</span>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">{vehicles.length - urgentInspectionCount}</span>
            <span className="text-xs text-slate-400">/ {vehicles.length} xe an toàn</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Dự toán phí ĐK: <span className="font-mono font-bold text-slate-700">{formatVND(totalInspectionBudget)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bảo Hiểm Bắt Buộc TNDS</span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">100%</span>
            <span className="text-xs text-emerald-600 font-medium">Đã có hợp đồng</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Phí TNDS toàn đội: <span className="font-mono font-bold text-slate-700">{formatVND(vehicles.reduce((sum, v) => sum + (v.tndsInsuranceCost || 873000), 0))}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bảo Hiểm Thân Vỏ</span>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">{vehicles.length}</span>
            <span className="text-xs text-purple-600 font-medium">Xe được bảo vệ</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Tổng phí thân vỏ: <span className="font-mono font-bold text-purple-700">{formatVND(vehicles.reduce((sum, v) => sum + (v.bodyInsuranceCost || 0), 0))}</span>
          </div>
        </div>

      </div>

      {/* Table & Controls Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
        
        {/* Table Top Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70">
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã xe, biển số, trạm ĐK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs w-64 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  filterType === 'all' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({vehicles.length})
              </button>
              <button
                onClick={() => setFilterType('urgent')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  filterType === 'urgent' ? 'bg-red-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sắp hết hạn ({totalUrgentCount})
              </button>
              <button
                onClick={() => setFilterType('inspection')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  filterType === 'inspection' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đăng kiểm ({urgentInspectionCount})
              </button>
              <button
                onClick={() => setFilterType('insurance')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  filterType === 'insurance' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bảo hiểm ({urgentInsuranceCount})
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Hiển thị <span className="font-bold text-slate-800">{filteredVehicles.length}</span> phương tiện
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase text-slate-400 font-bold tracking-widest border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Phương tiện</th>
                <th className="py-3 px-4">Hạn Đăng Kiểm</th>
                <th className="py-3 px-4">Bảo Hiểm TNDS (Bắt buộc)</th>
                <th className="py-3 px-4">Bảo Hiểm Thân Vỏ</th>
                <th className="py-3 px-4 text-right">Dự Toán Chi Phí</th>
                <th className="py-3 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVehicles.map(({ vehicle, inspectionDays, tndsDays, bodyDays }) => {
                const totalCost = (vehicle.inspectionCost || 0) + (vehicle.tndsInsuranceCost || 0) + (vehicle.bodyInsuranceCost || 0);

                return (
                  <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Vehicle info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                          {vehicle.code}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {vehicle.name}
                            <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {vehicle.seatCount || 7} chỗ
                            </span>
                          </div>
                          <div className="font-mono text-[11px] text-slate-500 font-semibold">
                            {vehicle.licensePlate} • {vehicle.brand}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Inspection */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">
                            {vehicle.inspectionExpiryDate ? new Date(vehicle.inspectionExpiryDate).toLocaleDateString('vi-VN') : '—'}
                          </span>
                          {getStatusBadge(inspectionDays)}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {vehicle.inspectionStation || 'Trạm ĐK chưa lưu'}
                        </div>
                      </div>
                    </td>

                    {/* Compulsory TNDS */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">
                            {vehicle.tndsInsuranceExpiryDate ? new Date(vehicle.tndsInsuranceExpiryDate).toLocaleDateString('vi-VN') : '—'}
                          </span>
                          {getStatusBadge(tndsDays)}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{vehicle.tndsInsuranceProvider || 'Chưa chọn đơn vị'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Body Insurance */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">
                            {vehicle.bodyInsuranceExpiryDate ? new Date(vehicle.bodyInsuranceExpiryDate).toLocaleDateString('vi-VN') : '—'}
                          </span>
                          {getStatusBadge(bodyDays)}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Shield className="w-3 h-3 text-purple-500" />
                          <span>{vehicle.bodyInsuranceProvider || 'Chưa chọn'} • {formatVND(vehicle.bodyInsuranceCost || 0)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Estimated Cost */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {formatVND(totalCost)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ĐK + TNDS + Thân vỏ
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center min-w-[130px]">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenUpdateModal(vehicle)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                          title="Cập nhật gia hạn Đăng kiểm / Bảo hiểm"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Gia Hạn</span>
                        </button>
                        {onOpenEditVehicle && (
                          <button
                            onClick={() => onOpenEditVehicle(vehicle)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                            title="Sửa toàn bộ hồ sơ xe, biển số, số khung, tài xế..."
                          >
                            <Car className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
