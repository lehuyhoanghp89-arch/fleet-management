import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment. Gemini features will return fallback response.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'dummy-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Maintenance Advisor Endpoint
  app.post('/api/gemini/advisor', async (req, res) => {
    try {
      const { vehicle, currentOdo, targetMilestone, query, conversationHistory } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          advice: `Chuyên gia kỹ thuật bảo dưỡng tổng hợp:\nĐối với dòng xe ${vehicle?.name || 'xe'} hiện tại ở mức ODO ${currentOdo?.toLocaleString('vi-VN')} km (Cấp bảo dưỡng tiếp theo: ${targetMilestone?.tierName || 'Định kỳ'}), quý khách cần tuân thủ nghiêm ngặt cấp độ dầu nhớt và phụ tùng chính hãng được chỉ định theo tiêu chuẩn nhà sản xuất để đảm bảo động cơ hoạt động bền bỉ và không ảnh hưởng đến điều kiện bảo hành.\n\n(Lưu ý: Để kích hoạt trợ lý AI chuyên sâu, vui lòng cấu hình GEMINI_API_KEY trong bảng Secrets)`,
          sources: ['Sổ tay bảo dưỡng chính hãng', 'Tài liệu hướng dẫn kỹ thuật bảo dưỡng định kỳ'],
        });
      }

      const ai = getAiClient();
      const prompt = `
Bạn là Kỹ sư Trưởng kiêm Cố vấn Kỹ thuật Bảo dưỡng Đội xe Chuyên nghiệp (Fleet Maintenance Specialist) am hiểu sâu sắc quy trình bảo dưỡng chính hãng của Mercedes-Benz (ASSYST PLUS), Ford Việt Nam (Everest, Transit), Kia (Carnival - Thaco Auto), Hyundai (Palisade - TC Motor).

Thông tin xe đang xử lý:
- Mã xe: ${vehicle?.code || 'N/A'} - ${vehicle?.name || 'Xe'}
- Hãng: ${vehicle?.brand || 'N/A'}
- Model & Động cơ: ${vehicle?.model || 'N/A'} | Động cơ: ${vehicle?.engine || 'N/A'} | Hộp số: ${vehicle?.transmission || 'N/A'}
- Số ODO hiện tại: ${currentOdo || vehicle?.currentOdo} km
- Mức tiêu thụ trung bình: ${vehicle?.averageKmPerDay || 50} km/ngày
- Mốc bảo dưỡng tiếp theo: ${targetMilestone?.targetOdo?.toLocaleString('vi-VN')} km (${targetMilestone?.tierName})
- Chi phí dự toán: ${targetMilestone?.estimatedCost?.toLocaleString('vi-VN')} VNĐ

Câu hỏi / Yêu cầu của Quản lý đội xe:
"${query || 'Hãy tư vấn chi tiết các hạng mục cần làm ở cấp bảo dưỡng tiếp theo, lưu ý phụ tùng quan trọng và cách tối ưu chi phí nhưng vẫn đảm bảo độ bền tối đa theo chuẩn hãng.'}"

Yêu cầu trả lời:
1. Đưa ra phân tích chuyên sâu, rõ ràng, đúng chuẩn sổ tay kỹ thuật của hãng cho dòng xe này.
2. Nêu rõ các phụ tùng bắt buộc phải thay thế (dầu nhớt chuẩn gì, lọc nào, dầu phanh, dầu số nếu có) và các hạng mục kiểm tra/vệ sinh.
3. Cảnh báo những rủi ro nếu bỏ qua hoặc chậm trễ ở mốc km này (ví dụ: máy dầu tắc lọc DPF, cặn kim phun, mài mòn van biến thiên, hao mòn dầu hộp số 9G/10R80/8-AT).
4. Đề xuất phương án dự toán chi phí và tối ưu ngân sách bảo dưỡng định kỳ.
Trình bày mạch lạc, lịch sự, chuyên nghiệp bằng tiếng Việt.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Bạn là chuyên gia tư vấn kỹ thuật bảo dưỡng ô tô đa hãng (Mercedes-Benz, Ford, Kia, Hyundai). Luôn đưa ra lời khuyên chính xác, thực tế theo sổ tay kỹ thuật nhà sản xuất tại Việt Nam.',
          temperature: 0.7,
        },
      });

      res.json({
        advice: response.text || 'Không có phản hồi từ hệ thống phân tích.',
        brandManualRef: targetMilestone?.brandNotes || 'Chính sách bảo dưỡng hãng',
      });
    } catch (error: any) {
      console.error('Error generating AI advice:', error);
      res.status(500).json({
        error: error.message || 'Lỗi xử lý yêu cầu AI',
        advice: 'Đã xảy ra sự cố khi kết nối tới máy chủ phân tích kỹ thuật. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.',
      });
    }
  });

  // Diagnostics & Cost Optimization Endpoint
  app.post('/api/gemini/diagnose', async (req, res) => {
    try {
      const { vehicle, symptoms, currentOdo } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          analysis: `Hiện tại xe ${vehicle?.name} ở mức ${currentOdo} km. Với hiện tượng "${symptoms}", bạn nên cho xe vào garage kiểm tra hệ thống phanh/gầm và đọc mã lỗi chuyên sâu.`,
        });
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Chẩn đoán hiện tượng bất thường xe:
- Xe: ${vehicle?.name} (${vehicle?.brand} ${vehicle?.model}), Động cơ: ${vehicle?.engine}, ODO: ${currentOdo} km
- Hiện tượng tài xế báo: "${symptoms}"

Hãy phân tích nguyên nhân tiềm ẩn theo cơ chế kỹ thuật ô tô, mức độ khẩn cấp (An toàn hay cần xử lý ngay), các bộ phận cần kiểm tra, và ước tính chi phí khắc phục sơ bộ.`,
      });

      res.json({ analysis: response.text });
    } catch (err: any) {
      console.error('Diagnostic error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite development middleware vs Static Production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fleet Maintenance System server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
