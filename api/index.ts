import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import crypto from "crypto";

const app = express();
app.use(express.json({ limit: "25mb" }));

// In-memory cache for poster grid analysis results
const analysisCache = new Map<string, any>();

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

Analyze the uploaded poster image carefully and perform deep visual OCR element detection, margin boundary snapping, and multi-hypothesis grid mapping:

1. Visual OCR & Precise Bounding Boxes:
   - Identify ALL major distinct text blocks and visual elements in the poster image.
   - For labels, transcribe the ACTUAL text written in the image.
   - Calculate precise bounding box percentage coordinates relative to the full poster canvas (0-100%):
     - x: left edge percentage (0 to 100)
     - y: top edge percentage (0 to 100)
     - width: element width percentage
     - height: element height percentage
   - Provide 4 to 12 distinct elements.

2. Margin & Grid Structure Mapping:
   - Determine underlying system type from ['swiss_modular', '12_column', '6_column', '3_column', 'asymmetric', 'baseline_grid', 'golden_ratio', 'rule_of_thirds', 'freeform_organic']
   - If elements do not follow rigid mathematical grid lines (e.g. hand-drawn, expressive, B-side poster, deconstructed layout), classify as 'freeform_organic'.
   - Determine outer margins matching the outermost text/visual bounding boxes.
   - Determine exact column and row counts (e.g. 2, 3, 4, 6, 12 columns, and 3, 4, 5, 8 rows).
   - Estimate columnGutter and rowGutter (1.0 to 5.0%).

3. Candidate Grid Hypotheses Evaluation & Korean Descriptions:
   - CRITICAL REQUIREMENT: Write ALL text description fields (systemNameKo, title, summary, alignmentNote, swissPrinciples, typeHierarchyRating) in clear, fluent Korean (한글).
   - "summary" should be a detailed, insightful 2-3 sentence Swiss grid analysis report in Korean explaining how text/images align to margins, baselines, and grid columns.
   - Propose 2-3 candidate grid hypotheses (candidateGrids) with varying column/row structure along with a fitScore percentage (0-100%) and Korean rationale explaining why that grid works for the poster.

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

export default app;
