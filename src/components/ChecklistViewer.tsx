import React, { useState } from 'react';
import { 
  Wrench, 
  Droplet, 
  Layers, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Vehicle } from '../types';
import { getBrandConfig, formatVND } from '../utils/maintenanceEngine';

interface ChecklistViewerProps {
  vehicle: Vehicle;
}

export const ChecklistViewer: React.FC<ChecklistViewerProps> = ({ vehicle }) => {
  const brandConfig = getBrandConfig(vehicle.brand);
  const [selectedTierCode, setSelectedTierCode] = useState<string>(brandConfig.tiers[0]?.tierCode || '');

  const activeTier = brandConfig.tiers.find(t => t.tierCode === selectedTierCode) || brandConfig.tiers[0];

  return (
    <div className="space-y-5">
      {/* Brand Technical Specifications Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h4 className="font-bold text-sm text-white">
              Tiêu Chuẩn Kỹ Thuật Bảo Dưỡng Hãng: {brandConfig.displayName}
            </h4>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono">
            Chu kỳ: {brandConfig.standardIntervalKm.toLocaleString('vi-VN')} km / lần
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {brandConfig.officialManualOverview}
        </p>

        {/* Fluid Specifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-start space-x-2 bg-slate-800/60 p-2.5 rounded-lg">
            <Droplet className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">Dầu nhớt động cơ khuyến nghị:</span>
              <span className="font-medium text-slate-200">{brandConfig.recommendedFluids.engineOil}</span>
            </div>
          </div>
          <div className="flex items-start space-x-2 bg-slate-800/60 p-2.5 rounded-lg">
            <Droplet className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">Dầu hộp số / Cầu vi sai:</span>
              <span className="font-medium text-slate-200">{brandConfig.recommendedFluids.transmissionOil}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Selector Buttons */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
          Chọn Cấp Bảo Dưỡng Để Tra Cứu Danh Mục Chi Tiết:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {brandConfig.tiers.map((tier, idx) => {
            const isSelected = tier.tierCode === activeTier.tierCode;
            return (
              <button
                key={tier.tierCode}
                onClick={() => setSelectedTierCode(tier.tierCode)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  CẤP {idx + 1}
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white truncate mt-0.5">
                  {tier.shortName}
                </div>
                <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 mt-1 font-semibold">
                  ~{formatVND(tier.items.reduce((s, i) => s + i.unitPrice + i.laborPrice, 0))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tier Breakdown */}
      {activeTier && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activeTier.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeTier.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-slate-400">Dự toán tổng thể:</span>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
                {formatVND(activeTier.items.reduce((s, i) => s + i.unitPrice + i.laborPrice, 0))}
              </div>
            </div>
          </div>

          {/* Parts and Labor Items Table */}
          <div className="space-y-2">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Bảng Báo Giá Chi Tiết Phụ Tùng & Nhân Công:
            </h5>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">STT</th>
                    <th className="py-2.5 px-3">Hạng mục & Phụ tùng chính hãng</th>
                    <th className="py-2.5 px-3 text-center">Hình thức</th>
                    <th className="py-2.5 px-3 text-right">Giá phụ tùng</th>
                    <th className="py-2.5 px-3 text-right">Nhân công</th>
                    <th className="py-2.5 px-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {activeTier.items.map((item, idx) => {
                    const totalItem = item.unitPrice + item.laborPrice;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-900 dark:text-slate-100">{item.name}</div>
                          {item.notes && <div className="text-[11px] text-slate-400">{item.notes}</div>}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.action === 'replace'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : item.action === 'clean'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {item.action === 'replace' ? 'Thay mới' : item.action === 'clean' ? 'Vệ sinh' : 'Kiểm tra'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {item.unitPrice > 0 ? formatVND(item.unitPrice) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {item.laborPrice > 0 ? formatVND(item.laborPrice) : 'Trọn gói'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {totalItem > 0 ? formatVND(totalItem) : 'Miễn phí'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Lưu ý kỹ thuật:</strong> Đơn giá có thể thay đổi tùy thuộc vào thời giá phụ tùng tại đại lý chính hãng hoặc garage liên kết. Hãy luôn yêu cầu kỹ thuật viên kiểm tra bằng máy chẩn đoán chuyên hãng trước và sau khi hoàn tất bảo dưỡng.
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
