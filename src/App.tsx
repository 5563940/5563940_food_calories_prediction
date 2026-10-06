/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Scale,
  Database,
  ArrowRight,
  FileCheck,
  HelpCircle
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { PortionWeightSelector } from './components/PortionWeightSelector';
import { ConstrainedOutputCard } from './components/ConstrainedOutputCard';
import { MacroVisualizer } from './components/MacroVisualizer';
import { DatabaseModal } from './components/DatabaseModal';
import { CameraModal } from './components/CameraModal';
import { MealHistory } from './components/MealHistory';
import {
  FOOD_DATABASE,
  FoodItem,
  NutritionCalculation,
  calculateNutrition,
  findMatchingFood
} from './data/foodDatabase';
import { SAMPLE_FOODS, SampleFood } from './data/sampleFoods';

export default function App() {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'matrix'>('presets');
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_FOODS[0].imageUrl);
  const [selectedSample, setSelectedSample] = useState<SampleFood | null>(SAMPLE_FOODS[0]);
  const [weightGrams, setWeightGrams] = useState<number>(SAMPLE_FOODS[0].defaultWeightGrams);
  const [manualFood, setManualFood] = useState<FoodItem | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<{
    rawOutput: string;
    calculation?: NutritionCalculation;
    isError?: boolean;
  } | null>(null);

  const [history, setHistory] = useState<NutritionCalculation[]>([]);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [matrixSearch, setMatrixSearch] = useState<string>('');

  // Initial calculation on mount for default sample
  useEffect(() => {
    runInitialCalculation();
  }, []);

  const runInitialCalculation = () => {
    const initialItem = findMatchingFood(SAMPLE_FOODS[0].matchedName);
    if (initialItem) {
      const calc = calculateNutrition(initialItem, SAMPLE_FOODS[0].defaultWeightGrams);
      setPredictionResult({
        rawOutput: calc.formattedOutput,
        calculation: calc,
        isError: false,
      });
    }
  };

  // When weight changes and we already have an active calculation, update scaling in real-time
  const handleWeightChange = (newWeight: number) => {
    setWeightGrams(newWeight);

    if (predictionResult && predictionResult.calculation && !predictionResult.isError) {
      const updatedCalc = calculateNutrition(predictionResult.calculation.foodItem, newWeight);
      setPredictionResult({
        rawOutput: updatedCalc.formattedOutput,
        calculation: updatedCalc,
        isError: false,
      });
    }
  };

  // Select a preset sample
  const handleSelectSample = (sample: SampleFood) => {
    setSelectedSample(sample);
    setSelectedImage(sample.imageUrl);
    setWeightGrams(sample.defaultWeightGrams);
    setManualFood(null);

    // If non-food test scenario
    if (sample.matchedName === 'NON_FOOD_TEST') {
      setPredictionResult({
        rawOutput: 'Error: Item not found in verified dataset matrix.',
        isError: true,
      });
      return;
    }

    const matched = findMatchingFood(sample.matchedName);
    if (matched) {
      const calc = calculateNutrition(matched, sample.defaultWeightGrams);
      setPredictionResult({
        rawOutput: calc.formattedOutput,
        calculation: calc,
        isError: false,
      });
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);
      setSelectedSample(null);
      setManualFood(null);
      setPredictionResult(null); // ready for user to click predict
    };
    reader.readAsDataURL(file);
  };

  // Handle camera capture
  const handleCameraCapture = (dataUrl: string) => {
    setSelectedImage(dataUrl);
    setSelectedSample(null);
    setManualFood(null);
    setPredictionResult(null);
  };

  // Handle manual food selection from matrix
  const handleSelectManualFood = (item: FoodItem) => {
    setManualFood(item);
    setSelectedSample(null);
    const calc = calculateNutrition(item, weightGrams);
    setPredictionResult({
      rawOutput: calc.formattedOutput,
      calculation: calc,
      isError: false,
    });
    setHistory((prev) => [calc, ...prev.slice(0, 19)]);
  };

  // Run AI Vision & Calorie Computation
  const handleRunPrediction = async () => {
    if (!selectedImage && !manualFood) return;

    setIsLoading(true);

    try {
      // If manual food is selected
      if (manualFood) {
        const calc = calculateNutrition(manualFood, weightGrams);
        setPredictionResult({
          rawOutput: calc.formattedOutput,
          calculation: calc,
          isError: false,
        });
        setHistory((prev) => [calc, ...prev.slice(0, 19)]);
        setIsLoading(false);
        return;
      }

      // If a preset is selected
      if (selectedSample) {
        if (selectedSample.matchedName === 'NON_FOOD_TEST') {
          // Simulate network latency for prototype feel
          await new Promise((r) => setTimeout(r, 600));
          setPredictionResult({
            rawOutput: 'Error: Item not found in verified dataset matrix.',
            isError: true,
          });
          setIsLoading(false);
          return;
        }

        const matched = findMatchingFood(selectedSample.matchedName);
        if (matched) {
          const calc = calculateNutrition(matched, weightGrams);
          setPredictionResult({
            rawOutput: calc.formattedOutput,
            calculation: calc,
            isError: false,
          });
          setHistory((prev) => [calc, ...prev.slice(0, 19)]);
          setIsLoading(false);
          return;
        }
      }

      // Convert image to base64 if not already dataUrl (e.g. Unsplash URL)
      let base64Payload = selectedImage || '';
      let mimeType = 'image/jpeg';

      if (selectedImage && selectedImage.startsWith('data:')) {
        const mimeMatch = selectedImage.match(/data:([^;]+);base64,/);
        if (mimeMatch) mimeType = mimeMatch[1];
      } else if (selectedImage && selectedImage.startsWith('http')) {
        try {
          const resp = await fetch(selectedImage);
          const blob = await resp.blob();
          base64Payload = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          mimeType = blob.type || 'image/jpeg';
        } catch {
          // fallback
        }
      }

      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Payload,
          mimeType,
          weightGrams,
          fallbackFoodName: selectedSample?.matchedName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Prediction request failed');
      }

      if (!data.success && data.rawOutput) {
        setPredictionResult({
          rawOutput: data.rawOutput,
          isError: true,
        });
      } else if (data.calculation) {
        setPredictionResult({
          rawOutput: data.rawOutput,
          calculation: data.calculation,
          isError: false,
        });
        setHistory((prev) => [data.calculation, ...prev.slice(0, 19)]);
      } else if (data.rawOutput) {
        setPredictionResult({
          rawOutput: data.rawOutput,
          isError: data.rawOutput.includes('Error:'),
        });
      }
    } catch (err: any) {
      console.error('Prediction error:', err);
      // If error occurs, check if we have a sample food fallback
      if (selectedSample && selectedSample.matchedName !== 'NON_FOOD_TEST') {
        const matched = findMatchingFood(selectedSample.matchedName);
        if (matched) {
          const calc = calculateNutrition(matched, weightGrams);
          setPredictionResult({
            rawOutput: calc.formattedOutput,
            calculation: calc,
            isError: false,
          });
          setHistory((prev) => [calc, ...prev.slice(0, 19)]);
        }
      } else {
        setPredictionResult({
          rawOutput: 'Error: Item not found in verified dataset matrix.',
          isError: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex flex-col">
      <Navbar
        onOpenDatabase={() => setIsDatabaseOpen(true)}
        databaseCount={FOOD_DATABASE.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Banner / Prototype Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Vision & Nutritional Computation Module
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              AI Food Calorie Prediction Prototype
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Examines uploaded food imagery, cross-references against the{' '}
              <button
                onClick={() => setIsDatabaseOpen(true)}
                className="text-emerald-300 hover:text-emerald-200 underline font-medium cursor-pointer"
              >
                248 verified food items in the database matrix
              </button>
              , and mathematically scales energy and macronutrients strictly to 1 decimal place with a 6-line constrained output format.
            </p>
          </div>
        </div>

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Input & Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Step 1: Input Food Image or Selection
                </span>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                  Vision Ready
                </span>
              </div>

              {/* Input Method Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('presets')}
                  className={`py-2 px-2.5 rounded-lg transition-all text-center cursor-pointer ${
                    activeTab === 'presets'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚡ Presets
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`py-2 px-2.5 rounded-lg transition-all text-center cursor-pointer ${
                    activeTab === 'upload'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📷 Upload / Cam
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('matrix')}
                  className={`py-2 px-2.5 rounded-lg transition-all text-center cursor-pointer ${
                    activeTab === 'matrix'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🔍 Database
                </button>
              </div>

              {/* Tab 1: Presets */}
              {activeTab === 'presets' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500 flex items-center justify-between">
                    <span>Curated Prototype Test Scenarios:</span>
                    <span className="text-[10px] text-slate-400">Click to load</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SAMPLE_FOODS.map((sample) => {
                      const isSelected = selectedSample?.id === sample.id;
                      const isNonFood = sample.id === 'sample_non_food';
                      return (
                        <button
                          key={sample.id}
                          type="button"
                          onClick={() => handleSelectSample(sample)}
                          className={`group relative rounded-xl border p-2 text-left transition-all overflow-hidden cursor-pointer ${
                            isSelected
                              ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/30'
                              : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 mb-1.5 relative">
                            <img
                              src={sample.imageUrl}
                              alt={sample.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            {isNonFood && (
                              <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-bold px-1 py-0.5 rounded shadow-xs">
                                Error Test
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {sample.title}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {sample.defaultWeightGrams}g default
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: Upload / Camera */}
              {activeTab === 'upload' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl cursor-pointer transition group text-center">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 mb-1 transition" />
                      <span className="text-xs font-semibold text-slate-700">Choose Image</span>
                      <span className="text-[10px] text-slate-400">JPG, PNG, WEBP</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl cursor-pointer transition group text-center"
                    >
                      <Camera className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 mb-1 transition" />
                      <span className="text-xs font-semibold text-slate-700">Use Live Camera</span>
                      <span className="text-[10px] text-slate-400">Snap Photo Now</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Manual Database Search */}
              {activeTab === 'matrix' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Quick search 248 items..."
                      value={matrixSearch}
                      onChange={(e) => setMatrixSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {FOOD_DATABASE.filter(f => !matrixSearch || f.name.toLowerCase().includes(matrixSearch.toLowerCase()))
                      .slice(0, 15)
                      .map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectManualFood(item)}
                          className={`w-full text-left p-2 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                            manualFood?.id === item.id
                              ? 'bg-emerald-600 text-white font-semibold'
                              : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <span className="truncate pr-2">{item.name}</span>
                          <span className="font-mono text-[11px] shrink-0 opacity-80">
                            {item.calories100g} kcal
                          </span>
                        </button>
                      ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDatabaseOpen(true)}
                    className="w-full text-center text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-2 rounded-lg transition cursor-pointer"
                  >
                    Open Full Database Matrix Table (248 Items) →
                  </button>
                </div>
              )}

              {/* Active Image Preview & Vision Scanner Effect */}
              {selectedImage && (
                <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                  <img
                    src={selectedImage}
                    alt="Active Food"
                    className="w-full h-full object-cover"
                  />

                  {/* Scanning Animation overlay when loading */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-xs flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-2" />
                      <div className="text-xs font-mono font-bold text-emerald-300 tracking-wider">
                        CROSS-REFERENCING MATRIX...
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Analyzing visual features & botanical markers
                      </div>
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse top-1/2" />
                    </div>
                  )}

                  {/* Identification Pill */}
                  {!isLoading && selectedSample && (
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/50 flex items-center justify-between text-white text-xs">
                      <span className="truncate font-medium">{selectedSample.title}</span>
                      <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                        Sample Input
                      </span>
                    </div>
                  )}
                  {!isLoading && manualFood && (
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/50 flex items-center justify-between text-white text-xs">
                      <span className="truncate font-medium">{manualFood.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                        Direct Database Match
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Portion Weight in Grams */}
              <div className="pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                  Step 2: Specify Portion Weight
                </span>
                <PortionWeightSelector
                  weightGrams={weightGrams}
                  onChange={handleWeightChange}
                  disabled={isLoading}
                />
              </div>

              {/* Step 3: Run Prediction */}
              <button
                type="button"
                onClick={handleRunPrediction}
                disabled={isLoading || (!selectedImage && !manualFood)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-md shadow-emerald-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Predicting & Scaling...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Vision & Calorie Computation</span>
                  </>
                )}
              </button>
            </div>

            {/* Meal History / Log */}
            <MealHistory
              history={history}
              onClear={() => setHistory([])}
              onSelect={(item) => {
                setPredictionResult({
                  rawOutput: item.formattedOutput,
                  calculation: item,
                  isError: false,
                });
                setWeightGrams(item.weightGrams);
              }}
            />
          </div>

          {/* RIGHT: Constrained Output & Deep Nutritional Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* The Constrained Output Format (Strict 6 Lines) */}
            {predictionResult ? (
              <ConstrainedOutputCard
                rawOutput={predictionResult.rawOutput}
                isError={predictionResult.isError}
              />
            ) : (
              <div className="border border-dashed border-slate-300 rounded-2xl p-8 text-center bg-white/60 space-y-2">
                <FileCheck className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-semibold text-slate-700">Awaiting Prediction</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select a food image, set the portion weight argument in grams, and click &ldquo;Run AI Vision & Calorie Computation&rdquo;.
                </p>
              </div>
            )}

            {/* Nutritional & Mathematical Breakdown Visualization */}
            {predictionResult && predictionResult.calculation && !predictionResult.isError && (
              <MacroVisualizer calculation={predictionResult.calculation} />
            )}

            {/* Database Matrix Quick Info Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Database Matrix Reference Specification
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDatabaseOpen(true)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                >
                  View All 248 Items →
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                The AI vision module cross-references features against the verified nutritional dataset matrix (scaled per 100g). If the item is completely unidentifiable or absent, the system responds strictly with:
              </p>
              
              <div className="p-2.5 rounded-lg bg-slate-900 text-rose-300 font-mono text-xs select-all">
                Error: Item not found in verified dataset matrix.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Formula: <code>(Value_100g * Weight) / 100</code></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Strict 1 decimal place rounding</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Database Modal */}
      <DatabaseModal
        isOpen={isDatabaseOpen}
        onClose={() => setIsDatabaseOpen(false)}
        foods={FOOD_DATABASE}
        onSelectFood={handleSelectManualFood}
      />

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}
