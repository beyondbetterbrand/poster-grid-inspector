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

  // Initialize Gemini AI Client
  const getAi = () => {
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
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

      const ai = getAi();

      const prompt = `You are an expert graphic design AI and computer vision inspector specialized in poster design, Swiss typography, and grid layout analysis.

Analyze this poster image from a Swiss Typography & Graphic Design perspective:

CRITICAL INSTRUCTIONS:
1. ALL text responses (systemNameKo, title, summary, alignmentNote, swissPrinciples, typeHierarchyRating, candidateGrids.rationale) MUST be written in friendly, natural, and professional Korean (한국어).

2. Summary (한글 분석 요약):
   - Write a rich, easy-to-understand 3-4 sentence report in Korean explaining the poster's visual layout, typography alignment, margins, and grid system.
   - Describe clearly how the title, subtitle, images, and body text are structured along vertical columns or horizontal baselines, and how it aligns with Swiss design principles (balance, legibility, rhythm).

3. Visual OCR & Precise Bounding Boxes:
   - Identify 4 to 12 major distinct text blocks and visual elements in the poster image.
   - Provide precise percentage bounding boxes relative to the poster canvas (0-100%): x, y, width, height.
   - For alignmentNote, write a short Korean description (e.g., "왼쪽 1컬럼 축에 정렬된 메인 타이틀").

4. Grid Parameters & Candidates:
   - Determine underlying systemType ('swiss_modular', '12_column', '6_column', '3_column', 'asymmetric', 'baseline_grid', 'golden_ratio', 'rule_of_thirds', 'freeform_organic').
   - Provide systemNameKo in clear Korean (e.g., "스위스 모듈러 12컬럼 시스템").
   - Suggest 2-3 candidate grid hypotheses with fitScore (0-100%) and Korean rationale.

5. Type Hierarchy Rating (타이포 위계 평가):
   - Provide a qualitative Korean grade evaluation for typeHierarchyRating (e.g. "S등급 (완벽한 정보 위계)", "A등급 (우수한 정보 위계)", "B등급 (양호한 정보 위계)").
   - NEVER output numerical scores or fraction formats like "7/10", "8/10", "7 / 10". MUST be a letter grade + Korean descriptive tag.

Respond ONLY with valid JSON conforming to the schema.`;

      const executeGenerateContent = async () => {
        const modelsToTry = [
          "gemini-2.5-flash",
          "gemini-flash-latest",
          "gemini-2.0-flash",
          "gemini-1.5-flash"
        ];
        let lastErr: any = null;

        for (const modelName of modelsToTry) {
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              if (attempt > 0) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
              const resp = await ai.models.generateContent({
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
              return resp;
            } catch (err: any) {
              lastErr = err;
              const msg = err?.message || "";
              // If 429 / Quota error on this model, break inner loop to immediately try the next model
              if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
                console.warn(`[Gemini Fallback] Model ${modelName} hit quota limit (429). Falling back to next model...`);
                break;
              }
            }
          }
        }
        throw lastErr;
      };

      const response = await executeGenerateContent();

      const rawText = response.text || "{}";
      const parsedData = JSON.parse(rawText);

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
      if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("429") || errMsg.includes("quota")) {
        return res.status(429).json({
          success: false,
          isRateLimit: true,
          error: "Gemini API 요청 한도(Quota Exceeded)에 도달했습니다. 1분 후 다시 시도하시거나, 이미 분석했던 포스터는 [분석 히스토리]에서 즉시 확인하실 수 있습니다.",
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
