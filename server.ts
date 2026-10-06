import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { FOOD_DATABASE, FOOD_LOOKUP, calculateNutrition, RAW_DATABASE_CSV, findMatchingFood } from './src/data/foodDatabase.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initializing server-side Gemini client utility if key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API: Get Database Matrix info
app.get('/api/database', (_req, res) => {
  res.json({
    totalCount: FOOD_DATABASE.length,
    items: FOOD_DATABASE,
  });
});

// API: Direct calculation endpoint
app.post('/api/calculate', (req, res) => {
  const { foodName, weightGrams } = req.body;
  if (!foodName || weightGrams === undefined) {
    return res.status(400).json({ error: 'Missing foodName or weightGrams' });
  }

  const weight = parseFloat(weightGrams) || 0;
  const matched = findMatchingFood(foodName);

  if (!matched) {
    return res.json({
      success: false,
      rawOutput: 'Error: Item not found in verified dataset matrix.',
    });
  }

  const calc = calculateNutrition(matched, weight);
  res.json({
    success: true,
    calculation: calc,
    rawOutput: calc.formattedOutput,
  });
});

// API: Vision food identification and prediction endpoint
app.post('/api/predict', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', weightGrams = 100, fallbackFoodName } = req.body;
    const parsedWeight = parseFloat(weightGrams) || 100;

    // If manual or fallback name passed directly without image
    if (!imageBase64 && fallbackFoodName) {
      const item = findMatchingFood(fallbackFoodName);
      if (!item) {
        return res.json({
          success: false,
          rawOutput: 'Error: Item not found in verified dataset matrix.',
        });
      }
      const calc = calculateNutrition(item, parsedWeight);
      return res.json({
        success: true,
        calculation: calc,
        rawOutput: calc.formattedOutput,
      });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Clean base64 string if data url prefix is included
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // If Gemini client is active, use gemini-3.8-flash for vision recognition
    if (aiClient) {
      const promptText = `You are the vision and nutritional computation module for an AI Food Calorie Prediction Prototype.

### DATABASE MATRIX (Cleaned Nutrition values scaled per 100g):
${RAW_DATABASE_CSV}

### SYSTEM LOGIC:
1. Examine the user's uploaded food image and cross-reference it with the DATABASE MATRIX above.
2. Identify the closest matching 'Food_Item' string. If the food item is completely unidentifiable, non-food, or absent from the database matrix, return: "Error: Item not found in verified dataset matrix."
3. Read the user's portion weight argument input in grams: ${parsedWeight}g.
4. Scale the nutrition data mathematically: Final_Value = (Value_100g * User_Weight_Grams) / 100
5. Round all final calculated numbers strictly to 1 decimal place.

### CONSTRAINED OUTPUT FORMAT:
You must return exactly 6 lines of plain text using the keys below. Do not include markdown headers, bold symbols (**), code block ticks (\`\`\`), or introductory conversation text.

Food: [Matched Name from Database]
Weight: ${parsedWeight}g
Calories: [Calculated Value] kcal
Carbs: [Calculated Value]g
Protein: [Calculated Value]g
Fat: [Calculated Value]g

If not found or unidentifiable, return only:
Error: Item not found in verified dataset matrix.`;

      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: cleanBase64,
                },
              },
              {
                text: promptText,
              },
            ],
          },
        });

        const outputText = (response.text || '').trim();

        if (outputText.includes('Error: Item not found in verified dataset matrix')) {
          return res.json({
            success: false,
            rawOutput: 'Error: Item not found in verified dataset matrix.',
          });
        }

        // Parse model output lines:
        // Food: ...
        // Weight: ...
        // Calories: ...
        // Carbs: ...
        // Protein: ...
        // Fat: ...
        const lines = outputText.split('\n').map(l => l.trim()).filter(Boolean);
        let foodMatched = '';
        for (const line of lines) {
          if (line.startsWith('Food:')) {
            foodMatched = line.replace('Food:', '').trim();
            break;
          }
        }

        // Cross-reference with our server ground-truth to guarantee 100% mathematical precision
        let dbItem = foodMatched ? findMatchingFood(foodMatched) : null;

        if (!dbItem && foodMatched) {
          // Try cleaning quotes
          dbItem = findMatchingFood(foodMatched.replace(/"/g, ''));
        }

        if (dbItem) {
          const calc = calculateNutrition(dbItem, parsedWeight);
          return res.json({
            success: true,
            calculation: calc,
            rawOutput: calc.formattedOutput,
            visionIdentified: dbItem.name,
          });
        }

        // If the model gave an exact 6-line block with a valid entry
        return res.json({
          success: true,
          rawOutput: outputText,
        });
      } catch (geminiError: any) {
        console.error('Gemini vision error:', geminiError);
        // Fall through to fallback matching if fallback food name was passed
        if (fallbackFoodName) {
          const item = findMatchingFood(fallbackFoodName);
          if (item) {
            const calc = calculateNutrition(item, parsedWeight);
            return res.json({
              success: true,
              calculation: calc,
              rawOutput: calc.formattedOutput,
              note: 'Calculated using fallback matcher',
            });
          }
        }
        return res.status(500).json({
          error: 'Error analyzing image: ' + (geminiError.message || 'Vision service error'),
        });
      }
    } else {
      // If API key is not configured, fallback gracefully using fallbackFoodName or image similarity simulation
      if (fallbackFoodName) {
        if (fallbackFoodName === 'NON_FOOD_TEST') {
          return res.json({
            success: false,
            rawOutput: 'Error: Item not found in verified dataset matrix.',
          });
        }
        const item = findMatchingFood(fallbackFoodName);
        if (item) {
          const calc = calculateNutrition(item, parsedWeight);
          return res.json({
            success: true,
            calculation: calc,
            rawOutput: calc.formattedOutput,
            simulated: true,
          });
        }
      }

      return res.json({
        success: false,
        rawOutput: 'Error: Item not found in verified dataset matrix.',
        message: 'No Gemini API key attached and item could not be matched.',
      });
    }
  } catch (error: any) {
    console.error('Server predict error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Setup Vite middleware in dev or static serve in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Food Calorie Prediction Prototype running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
