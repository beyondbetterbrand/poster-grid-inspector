import { GoogleGenAI, Type } from "@google/genai";
import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

// In-memory cache for poster grid analysis results to ensure consistent output for identical images
const analysisCache = new Map<string, any>();

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
        return res.json({ success: true, data: analysisCache.get(cacheKey) });
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

Respond ONLY with valid JSON conforming to the schema.`;

      const executeGenerateContent = async () => {
        const modelsToTry = ["gemini-3.6-flash", "gemini-flash-latest"];
        let lastErr: any = null;

        for (const modelName of modelsToTry) {
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              if (attempt > 0) {
                await new Promise((resolve) => setTimeout(resolve, 1200));
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
              if (!msg.includes("429") && !msg.includes("RESOURCE_EXHAUSTED")) {
                throw err;
              }
            }
          }
        }
        throw lastErr;
      };

      const response = await executeGenerateContent();

      const rawText = response.text || "{}";
      const parsedData = JSON.parse(rawText);

      // Cache result for identical image base64
      analysisCache.set(cacheKey, parsedData);

      return res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error("Poster Grid Analysis error:", error);
      const errMsg = error?.message || "";
      if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("429") || errMsg.includes("quota")) {
        return res.status(429).json({
          success: false,
          error: "Gemini AI 분석 호출 한도(Rate Limit)에 도달했습니다. 약 15초 후 [다시 분석] 버튼을 눌러주세요.",
        });
      }
      return res.status(500).json({
        success: false,
        error: errMsg || "포스터 분석 중 서버 오류가 발생했습니다.",
      });
    }
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
