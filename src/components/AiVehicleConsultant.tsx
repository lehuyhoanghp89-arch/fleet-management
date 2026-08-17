import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2,
  BookOpen
} from 'lucide-react';
import { Vehicle, MaintenanceMilestone } from '../types';

interface AiVehicleConsultantProps {
  vehicle: Vehicle;
  nextMilestone: MaintenanceMilestone;
}

export const AiVehicleConsultant: React.FC<AiVehicleConsultantProps> = ({
  vehicle,
  nextMilestone
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: `Xin chào! Tôi là Trợ Lý Kỹ Thuật Bảo Dưỡng Hãng của ${vehicle.name} (${vehicle.brand}).\n\nHiện tại xe đang ở số ODO ${vehicle.currentOdo.toLocaleString('vi-VN')} km. Mốc bảo dưỡng tiếp theo là **${nextMilestone.targetOdo.toLocaleString('vi-VN')} km** (${nextMilestone.tierName}) với dự toán chi phí chuẩn hãng khoảng **${nextMilestone.estimatedCost.toLocaleString('vi-VN')} VNĐ**.\n\nBạn cần tư vấn chi tiết về chủng loại phụ tùng, dầu nhớt chuẩn hãng, giải pháp tối ưu chi phí hay kiểm tra hiện tượng bất thường nào không?`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sampleQuestions = [
    `Cấp bảo dưỡng ${nextMilestone.shortTier} này bắt buộc phải thay những phụ tùng gì?`,
    `Loại dầu nhớt và dầu hộp số chuẩn chính hãng cho ${vehicle.name} là gì?`,
    `Có cách nào tối ưu chi phí bảo dưỡng mốc ${nextMilestone.targetOdo.toLocaleString('vi-VN')}km nhưng vẫn an toàn tuyệt đối không?`,
    `Nếu chạy quá hạn 1,000 - 2,000 km mốc này thì xe sẽ gặp rủi ro gì?`
  ];

  const handleSendMessage = async (queryToSend?: string) => {
    const text = queryToSend || inputQuery;
    if (!text.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user' as const, text }];
    setMessages(newMessages);
    if (!queryToSend) setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle,
          currentOdo: vehicle.currentOdo,
          targetMilestone: nextMilestone,
          query: text,
          conversationHistory: newMessages,
        }),
      });

      const data = await response.json();
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: data.advice || 'Đã có phản hồi từ máy chủ tư vấn kỹ thuật.',
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: 'Rất tiếc, đã có lỗi kết nối tới máy chủ AI. Vui lòng kiểm tra lại đường truyền hoặc thử lại.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-[520px]">
      {/* Top Spec Card */}
      <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-indigo-900 dark:text-indigo-200">
            Cố vấn AI dựa trên Sổ tay kỹ thuật chính hãng {vehicle.brand}
          </span>
        </div>
        <span className="font-mono text-[11px] text-indigo-700 dark:text-indigo-300">
          Mốc kế tiếp: {nextMilestone.targetOdo.toLocaleString('vi-VN')} km ({nextMilestone.shortTier})
        </span>
      </div>

      {/* Suggested Quick Questions */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3.5 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2.5 ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3 leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700 shadow-2xs'
              }`}
            >
              {m.text}
            </div>

            {m.role === 'user' && (
              <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center text-white shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-500 text-xs p-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Chuyên gia kỹ thuật đang đối soát tài liệu hãng...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center space-x-2"
      >
        <input
          type="text"
          placeholder="Hỏi về phụ tùng, dầu nhớt, giá hãng, triệu chứng xe..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-1 px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading || !inputQuery.trim()}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-1 transition-colors shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Gửi</span>
        </button>
      </form>
    </div>
  );
};
