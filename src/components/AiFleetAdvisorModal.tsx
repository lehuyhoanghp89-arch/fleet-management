import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, Loader2, BookOpen, ShieldAlert, Cpu } from 'lucide-react';
import { Vehicle } from '../types';

interface AiFleetAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
}

export const AiFleetAdvisorModal: React.FC<AiFleetAdvisorModalProps> = ({
  isOpen,
  onClose,
  vehicles,
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: `Xin chào Quản lý Đội xe!\n\nTôi là Trợ lý AI Kỹ Thuật Tổng Thể Đội Xe (được nạp đầy đủ sổ tay hướng dẫn bảo dưỡng của Mercedes-Benz, Ford, Kia, Hyundai).\n\nTôi có thể giúp bạn:\n1. Phân tích tối ưu chi phí phụ tùng & dầu nhớt cho từng dòng xe\n2. Xử lý bài toán ngày chạy nhiều / ngày chạy ít để cân đối lịch bảo dưỡng\n3. Hướng dẫn phân biệt cấp bảo dưỡng Cấp 1, Cấp 2, Cấp 3, Cấp 4\n4. Chẩn đoán triệu chứng kỹ thuật bất thường (hộp số 9G-TRONIC, 10-AT, DPF, AdBlue...). Bạn muốn tư vấn vấn đề gì?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickQuestions = [
    'Làm thế nào để dự toán ngân sách chính xác khi xe có ngày chạy 200km có ngày đứng yên?',
    'Phân biệt rõ chu kỳ và cấp bảo dưỡng của Mercedes V250 vs Ford Everest vs Kia Carnival?',
    'Dầu nhớt chuẩn cho động cơ Diesel Bi-Turbo Ford Everest và GLS450 là gì?',
    'Tại sao bảo dưỡng cấp 4 (đại tu) chi phí lại cao và bao gồm các hạng mục gì?'
  ];

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const newMsgs = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(newMsgs);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptomDescription: textToSend,
          vehicleContext: `Đội xe gồm 6 xe: ${vehicles.map(v => `${v.code} (${v.name}, ODO: ${v.currentOdo} km)`).join(', ')}`,
        }),
      });

      const data = await res.json();
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          text: data.diagnosis || 'Đã có kết quả phân tích kỹ thuật.',
        },
      ]);
    } catch (e) {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          text: 'Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra lại.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full h-[85vh] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-900 to-slate-900 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/30 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">
                Cố Vấn Kỹ Thuật AI Đội Xe (Official Manuals)
              </h2>
              <p className="text-xs text-indigo-200">
                Tích hợp dữ liệu bảo dưỡng chuẩn hãng Mercedes-Benz, Ford, Kia & Hyundai
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick prompt chips */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors border border-slate-200 dark:border-slate-700 shrink-0 font-medium"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs bg-slate-50/40 dark:bg-slate-900/40">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700 shadow-2xs'
                }`}
              >
                {m.text}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-700 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-500 text-xs p-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Chuyên gia AI đang phân tích dữ liệu đội xe và sổ tay kỹ thuật...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Hỏi về chu kỳ bảo dưỡng, tối ưu ngân sách, kiểm tra phụ tùng xe..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Gửi</span>
          </button>
        </form>

      </div>
    </div>
  );
};
