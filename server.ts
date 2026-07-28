import { GoogleGenAI, Type } from "@google/genai";
import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

// In-memory cache and history store for poster grid analysis
const analysisCache = new Map<string, any>();

interface AnalysisHistoryRecord {
  id: string;
  cacheKey: string;
  title: string;
  systemNameKo: string;
  confidence: number;
  fitScore?: number;
  createdAt: string;
  imageBase64: string;
  analysisData: any;
}

const analysisHistoryStore: AnalysisHistoryRecord[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // Helper to retrieve all configured Gemini API keys for automatic key rotation
  const getApiKeys = () => {
    const keys: string[] = [];
    if (process.env.GEMINI_API_KEYS) {
      keys.push(...process.env.GEMINI_API_KEYS.split(',').map((k) => k.trim()));
    }
    if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY.trim());
    if (process.env.GEMINI_API_KEY_2) keys.push(process.env.GEMINI_API_KEY_2.trim());
    if (process.env.GEMINI_API_KEY_3) keys.push(process.env.GEMINI_API_KEY_3.trim());

    const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));
    return uniqueKeys.length > 0 ? uniqueKeys : [process.env.GEMINI_API_KEY];
  };

  // API Route for Poster Grid Analysis
  app.post("/api/analyze-grid", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/png" } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Image content is required for grid analysis" });
      }

      // Safely extract clean base64 data regardless of data URI prefix format
      const cleanBase64 = imageBase64.includes(",")
        ? imageBase64.split(",")[1]
        : imageBase64;

      // Calculate simple hash key for caching identical images
      const cacheKey = crypto.createHash("sha256").update(cleanBase64).digest("hex");
      
      if (analysisCache.has(cacheKey)) {
        const cachedData = analysisCache.get(cacheKey);
        // Find existing history record or create/update it
        let existingRecord = analysisHistoryStore.find((item) => item.cacheKey === cacheKey);
        if (!existingRecord) {
          existingRecord = {
            id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            cacheKey,
            title: cachedData.title || "포스터 레이아웃 분석",
            systemNameKo: cachedData.systemNameKo || "그리드 시스템",
            confidence: cachedData.confidence || 90,
            createdAt: new Date().toISOString(),
            imageBase64: imageBase64,
            analysisData: cachedData,
          };
          analysisHistoryStore.unshift(existingRecord);
        } else {
          // Bring to top
          const index = analysisHistoryStore.indexOf(existingRecord);
          if (index > 0) {
            analysisHistoryStore.splice(index, 1);
            analysisHistoryStore.unshift(existingRecord);
          }
        }
        return res.json({ success: true, data: cachedData, isCached: true, historyId: existingRecord.id });
      }

      // Extract detected mime type if present in data URI
      let effectiveMimeType = mimeType;
      const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,/);
      if (mimeMatch && mimeMatch[1]) {
        effectiveMimeType = mimeMatch[1];
      }

      const prompt = `Analyze this poster image's grid & visual layout.
Output concise JSON in Korean:
- systemType, systemNameKo, confidence (0-100), title, summary (1-2 concise Korean sentences).
- gridParams: columns, rows, marginTop, marginBottom, marginLeft, marginRight (0-100%).
- detectedElements (max 6 key text/image blocks): id, label, type, x, y, width, height (0-100%), short alignmentNote (3-5 words).
- keylines (max 4 key alignments): id, type, position, label.
- swissPrinciples (max 3 concise bullet phrases).`;

      const executeGenerateContent = async () => {
        const apiKeys = getApiKeys();
        const modelsToTry = [
          "gemini-3.5-flash-lite",
          "gemini-3.1-flash-lite",
        ];
        let lastErr: any = null;

        for (const currentKey of apiKeys) {
          if (!currentKey) continue;
          const aiInstance = new GoogleGenAI({
            apiKey: currentKey,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build",
              },
            },
          });

          for (const modelName of modelsToTry) {
            for (let attempt = 0; attempt < 2; attempt++) {
              try {
                if (attempt > 0) {
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                }
                console.log(`[Gemini API] Requesting model: ${modelName} (attempt ${attempt + 1})`);
                const resp = await aiInstance.models.generateContent({
                  model: modelName,
                  contents: [
                    {
                      inlineData: {
                        data: cleanBase64,
                        mimeType: effectiveMimeType,
                      },
                    },
                    { text: prompt },
                  ],
                  config: {
                    temperature: 0,
                    maxOutputTokens: 600,
                    thinkingConfig: {
                      thinkingBudget: 0,
                    },
                    responseMimeType: "application/json",
                    responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                        systemType: { type: Type.STRING },
                        systemNameKo: { type: Type.STRING },
                        confidence: { type: Type.NUMBER },
                        title: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        gridParams: {
                          type: Type.OBJECT,
                          properties: {
                            columns: { type: Type.NUMBER },
                            rows: { type: Type.NUMBER },
                            marginTop: { type: Type.NUMBER },
                            marginBottom: { type: Type.NUMBER },
                            marginLeft: { type: Type.NUMBER },
                            marginRight: { type: Type.NUMBER },
                            columnGutter: { type: Type.NUMBER },
                            rowGutter: { type: Type.NUMBER },
                            baselineSpacing: { type: Type.NUMBER },
                            diagonalAngle: { type: Type.NUMBER },
                          },
                          required: [
                            "columns",
                            "rows",
                            "marginTop",
                            "marginBottom",
                            "marginLeft",
                            "marginRight",
                          ],
                        },
                        detectedElements: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              label: { type: Type.STRING },
                              type: { type: Type.STRING },
                              x: { type: Type.NUMBER },
                              y: { type: Type.NUMBER },
                              width: { type: Type.NUMBER },
                              height: { type: Type.NUMBER },
                              alignmentNote: { type: Type.STRING },
                            },
                            required: ["id", "label", "type", "x", "y", "width", "height"],
                          },
                        },
                        keylines: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              type: { type: Type.STRING },
                              position: { type: Type.NUMBER },
                              label: { type: Type.STRING },
                            },
                            required: ["id", "type", "position", "label"],
                          },
                        },
                        swissPrinciples: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        typeHierarchyRating: { type: Type.STRING },
                        whitespaceRatio: { type: Type.STRING },
                        colorPalette: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: [
                        "systemType",
                        "systemNameKo",
                        "confidence",
                        "title",
                        "summary",
                        "gridParams",
                        "detectedElements",
                        "keylines",
                        "swissPrinciples",
                      ],
                    },
                  },
                });
                console.log(`[Gemini API Success] Model ${modelName} succeeded! Usage:`, resp.usageMetadata);
                return { resp, usedModel: modelName };
              } catch (err: any) {
                lastErr = err;
                const msg = err?.message || String(err);
                console.warn(`[Gemini API Error] Model ${modelName} attempt ${attempt + 1} failed:`, msg);
                if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("404") || msg.includes("NOT_FOUND")) {
                  console.warn(`[Gemini Fallback] Model ${modelName} failed (${msg.slice(0, 80)}). Trying next model...`);
                  break;
                }
              }
            }
          }
        }
        throw lastErr;
      };

      const { resp, usedModel } = await executeGenerateContent();

      const rawText = resp.text || "{}";
      const parsedData = JSON.parse(rawText);

      parsedData._usedModel = usedModel;
      parsedData._usage = resp.usageMetadata || null;

      if (typeof parsedData.confidence === 'number') {
        if (parsedData.confidence <= 1) {
          parsedData.confidence = Math.round(parsedData.confidence * 100);
        } else {
          parsedData.confidence = Math.round(parsedData.confidence);
        }
      }

      // Cache result for identical image base64
      analysisCache.set(cacheKey, parsedData);

      const newHistoryRecord: AnalysisHistoryRecord = {
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        cacheKey,
        title: parsedData.title || "포스터 레이아웃 분석",
        systemNameKo: parsedData.systemNameKo || "그리드 시스템",
        confidence: parsedData.confidence || 90,
        createdAt: new Date().toISOString(),
        imageBase64: imageBase64,
        analysisData: parsedData,
      };

      // Keep max 50 items in memory history
      analysisHistoryStore.unshift(newHistoryRecord);
      if (analysisHistoryStore.length > 50) {
        analysisHistoryStore.pop();
      }

      return res.json({ success: true, data: parsedData, isCached: false, historyId: newHistoryRecord.id });
    } catch (error: any) {
      console.error("Poster Grid Analysis error:", error);
      const errMsg = error?.message || "";
      const isQuotaErr = errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("429") || errMsg.includes("quota");

      if (isQuotaErr) {
        const isRpd = errMsg.toLowerCase().includes("perday") || errMsg.toLowerCase().includes("day");
        const isRpm = errMsg.toLowerCase().includes("perminute") || errMsg.toLowerCase().includes("minute");

        let quotaType: "RPM" | "RPD" | "GENERAL" = "GENERAL";
        let detailMessage = "Gemini 무료 API 한도(RPM 또는 RPD)에 도달하였습니다.";

        if (isRpd) {
          quotaType = "RPD";
          detailMessage = "일일 무료 요청 한도(RPD: 1,500회)가 모두 소진되었습니다. 60초 대기 방식으로는 해결되지 않으며, 매일 한국시간 오후 4시(PST 자정)에 초기화됩니다.";
        } else if (isRpm) {
          quotaType = "RPM";
          detailMessage = "분당 요청 한도(RPM: 15회)에 도달하였습니다. 약 1분(60초) 내외 대기 후 리셋됩니다.";
        } else {
          detailMessage = "Gemini API 사용량 한도(429)에 도달하였습니다. 분당 한도(RPM)일 경우 1분 후 가능하며, 일일 한도(RPD) 소진 시 매일 오후 4시(PST 자정)에 초기화됩니다.";
        }

        return res.status(429).json({
          success: false,
          isRateLimit: true,
          quotaType,
          error: detailMessage,
          rawError: errMsg,
        });
      }
      return res.status(500).json({
        success: false,
        error: errMsg || "포스터 분석 중 서버 오류가 발생했습니다.",
      });
    }
  });

  // REST API: Get All Analysis History List
  app.get("/api/history", (req, res) => {
    // Return history summary items without heavy payload
    const list = analysisHistoryStore.map((item) => ({
      id: item.id,
      cacheKey: item.cacheKey,
      title: item.title,
      systemNameKo: item.systemNameKo,
      confidence: item.confidence,
      createdAt: item.createdAt,
      imageBase64: item.imageBase64,
    }));
    return res.json({ success: true, count: list.length, history: list });
  });

  // REST API: Get Specific History Item Full Details
  app.get("/api/history/:id", (req, res) => {
    const item = analysisHistoryStore.find((h) => h.id === req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: "History record not found" });
    }
    return res.json({ success: true, item });
  });

  // REST API: Delete Single History Item
  app.delete("/api/history/:id", (req, res) => {
    const index = analysisHistoryStore.findIndex((h) => h.id === req.params.id);
    if (index !== -1) {
      analysisHistoryStore.splice(index, 1);
      return res.json({ success: true, message: "History item deleted" });
    }
    return res.status(404).json({ success: false, error: "Item not found" });
  });

  // REST API: Clear All History
  app.delete("/api/history", (req, res) => {
    analysisHistoryStore.length = 0;
    return res.json({ success: true, message: "All history cleared" });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Poster Grid Inspector Server listening on port ${PORT}`);
  });
}

startServer();
