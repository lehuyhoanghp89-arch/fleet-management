import React, { useState } from 'react';
import { 
  FileText, 
  Car, 
  Search, 
  Download, 
  Printer, 
  User, 
  Phone, 
  Fuel, 
  Gauge, 
  Shield, 
  Calendar, 
  Wrench, 
  CheckCircle2, 
  Info,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Vehicle } from '../types';
import { formatVND } from '../utils/maintenanceEngine';

interface FleetSpecsTableViewProps {
  vehicles: Vehicle[];
  onOpenDetail: (vehicle: Vehicle) => void;
  onOpenOdoUpdate: (vehicle: Vehicle) => void;
  onOpenComplianceUpdate: (vehicle: Vehicle) => void;
  onOpenEditVehicle: (vehicle: Vehicle) => void;
}

export const FleetSpecsTableView: React.FC<FleetSpecsTableViewProps> = ({
  vehicles,
  onOpenDetail,
  onOpenOdoUpdate,
  onOpenComplianceUpdate,
  onOpenEditVehicle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('Tất cả');

  const filteredVehicles = vehicles.filter(v => {
    if (brandFilter !== 'Tất cả' && v.brand !== brandFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        v.code.toLowerCase().includes(q) ||
        v.name.toLowerCase().includes(q) ||
        v.licensePlate.toLowerCase().includes(q) ||
        (v.vinNumber && v.vinNumber.toLowerCase().includes(q)) ||
        (v.engineNumber && v.engineNumber.toLowerCase().includes(q)) ||
        (v.driverName && v.driverName.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = [
      'Mã xe',
      'Tên phương tiện',
      'Hãng xe',
      'Năm SX',
      'Biển số',
      'Số chỗ',
      'Động cơ',
      'Hộp số',
      'Nhiên liệu',
      'Dung tích nhớt',
      'Số khung (VIN)',
      'Số máy',
      'ODO Hiện tại (km)',
      'TB Ngày (km/ngày - Tự tính)',
      'Hạn Đăng kiểm',
      'Trạm ĐK',
      'Hạn BH TNDS',
      'Nhà BH TNDS',
      'Hạn BH Thân vỏ',
      'Tài xế phụ trách',
      'Số điện thoại',
      'Ghi chú'
    ];

    const rows = vehicles.map(v => [
      `"${v.code}"`,
      `"${v.name}"`,
      `"${v.brand}"`,
      v.year,
      `"${v.licensePlate}"`,
      v.seatCount || 7,
      `"${v.engine}"`,
      `"${v.transmission}"`,
      `"${v.fuelType}"`,
      `"${v.oilCapacityLiters || '—'}"`,
      `"${v.vinNumber || '—'}"`,
      `"${v.engineNumber || '—'}"`,
      v.currentOdo,
      v.averageKmPerDay,
      `"${v.inspectionExpiryDate || '—'}"`,
      `"${v.inspectionStation || '—'}"`,
      `"${v.tndsInsuranceExpiryDate || '—'}"`,
      `"${v.tndsInsuranceProvider || '—'}"`,
      `"${v.bodyInsuranceExpiryDate || '—'}"`,
      `"${v.driverName || '—'}"`,
      `"${v.driverPhone || '—'}"`,
      `"${v.notes || '—'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ho_so_ky_thuat_toan_doi_xe_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner (#0F172A Professional Polish) */}
      <div className="p-6 bg-[#0F172A] text-white rounded-2xl border border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Hồ Sơ Kỹ Thuật & Pháp Lý Toàn Bộ Đội Xe
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Bảng dữ liệu tổng thể chi tiết nhất về toàn bộ xe trong đội: Thông số động cơ, hộp số, dung tích nhớt máy, số khung VIN, số máy, tài xế phụ trách, ODO thực tế, hạn đăng kiểm và bảo hiểm.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Xuất File CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>In Hồ Sơ Xe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
        
        {/* Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70">
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã xe, tên xe, biển số, số khung, tài xế..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs w-72 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
              {['Tất cả', 'Mercedes-Benz', 'Ford', 'Kia', 'Hyundai'].map((b) => (
                <button
                  key={b}
                  onClick={() => setBrandFilter(b)}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    brandFilter === b ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Mức chạy TB (km/ngày) do hệ thống tự động tính từ lịch sử ODO.</span>
          </div>
        </div>

        {/* Big Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-[11px] uppercase text-slate-400 font-bold tracking-wider border-b border-slate-200 sticky top-0">
              <tr>
                <th className="py-3 px-3">Mã xe</th>
                <th className="py-3 px-3">Tên xe & Biển số</th>
                <th className="py-3 px-3">Thông số Kỹ Thuật (Động cơ & Nhớt)</th>
                <th className="py-3 px-3">Số Khung (VIN) & Số Máy</th>
                <th className="py-3 px-3 text-right">Số ODO Hiện Tại</th>
                <th className="py-3 px-3 text-center">Quãng đường TB/Ngày (Hệ thống tính)</th>
                <th className="py-3 px-3">Hồ Sơ Đăng Kiểm</th>
                <th className="py-3 px-3">Hồ Sơ Bảo Hiểm</th>
                <th className="py-3 px-3">Tài Xế Phụ Trách</th>
                <th className="py-3 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Code & Brand */}
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 align-top">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white block text-center">
                      {vehicle.code}
                    </span>
                    <span className="text-[10px] text-slate-500 block text-center mt-1 font-sans">
                      {vehicle.brand}
                    </span>
                  </td>

                  {/* Vehicle Name, Plate, Year, Seats */}
                  <td className="py-3 px-3 align-top min-w-[170px]">
                    <div className="font-bold text-slate-900 text-sm">{vehicle.name}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {vehicle.licensePlate}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {vehicle.year} • {vehicle.seatCount || 7} chỗ
                      </span>
                    </div>
                  </td>

                  {/* Engine & Transmission & Oil */}
                  <td className="py-3 px-3 align-top min-w-[200px]">
                    <div className="font-semibold text-slate-800">{vehicle.engine}</div>
                    <div className="text-[11px] text-slate-500">{vehicle.transmission} • {vehicle.fuelType}</div>
                    <div className="text-[11px] text-blue-700 font-medium mt-0.5">
                      Nhớt máy: {vehicle.oilCapacityLiters || 'Định mức theo hãng'}
                    </div>
                  </td>

                  {/* VIN & Engine No */}
                  <td className="py-3 px-3 align-top font-mono text-[11px] min-w-[170px]">
                    <div className="text-slate-800">
                      <span className="text-slate-400 select-none">VIN: </span>
                      <span className="font-semibold">{vehicle.vinNumber || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      <span className="text-slate-400 select-none">MÁY: </span>
                      <span>{vehicle.engineNumber || 'Chưa cập nhật'}</span>
                    </div>
                  </td>

                  {/* ODO */}
                  <td className="py-3 px-3 align-top text-right min-w-[120px]">
                    <div className="font-mono font-extrabold text-slate-900 text-sm">
                      {vehicle.currentOdo.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">km</span>
                    </div>
                    <button
                      onClick={() => onOpenOdoUpdate(vehicle)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 underline font-medium mt-0.5 block ml-auto"
                    >
                      Cập nhật km
                    </button>
                  </td>

                  {/* Average Daily Km (System calculated) */}
                  <td className="py-3 px-3 align-top text-center min-w-[130px]">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-mono font-bold text-xs border border-blue-200">
                      ~{vehicle.averageKmPerDay} km/ngày
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      Chu kỳ: {(vehicle.baseCycleKm || 10000).toLocaleString('vi-VN')} km
                    </span>
                  </td>

                  {/* Inspection */}
                  <td className="py-3 px-3 align-top min-w-[160px]">
                    <div className="font-mono font-bold text-slate-900">
                      {vehicle.inspectionExpiryDate ? new Date(vehicle.inspectionExpiryDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                      {vehicle.inspectionStation || 'Trạm ĐK chưa lưu'}
                    </div>
                  </td>

                  {/* Insurance */}
                  <td className="py-3 px-3 align-top min-w-[180px]">
                    <div className="text-[11px]">
                      <span className="font-bold text-slate-800">TNDS: </span>
                      <span className="font-mono text-slate-900 font-semibold">
                        {vehicle.tndsInsuranceExpiryDate ? new Date(vehicle.tndsInsuranceExpiryDate).toLocaleDateString('vi-VN') : '—'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      <span className="font-bold text-purple-700">Thân vỏ: </span>
                      <span className="font-mono">
                        {vehicle.bodyInsuranceExpiryDate ? new Date(vehicle.bodyInsuranceExpiryDate).toLocaleDateString('vi-VN') : '—'}
                      </span>
                    </div>
                  </td>

                  {/* Driver */}
                  <td className="py-3 px-3 align-top min-w-[150px]">
                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{vehicle.driverName || 'Chưa gán'}</span>
                    </div>
                    {vehicle.driverPhone && (
                      <div className="font-mono text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{vehicle.driverPhone}</span>
                      </div>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 align-top text-center min-w-[110px]">
                    <div className="flex flex-col gap-1.5 items-center">
                      <button
                        onClick={() => onOpenEditVehicle(vehicle)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold w-full shadow-2xs transition-colors flex items-center justify-center gap-1"
                        title="Chỉnh sửa toàn bộ thông tin xe, biển số, số khung, số máy, tài xế"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>Sửa hồ sơ</span>
                      </button>
                      <div className="grid grid-cols-2 gap-1 w-full">
                        <button
                          onClick={() => onOpenDetail(vehicle)}
                          className="px-1.5 py-1 bg-slate-900 text-white rounded hover:bg-slate-800 text-[10px] font-semibold"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => onOpenComplianceUpdate(vehicle)}
                          className="px-1.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 text-[10px] font-semibold"
                        >
                          ĐK / BH
                        </button>
                      </div>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
