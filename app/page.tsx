"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

type Goal = "fat_loss" | "muscle_gain" | "recomposition" | "health";
type TrainingMode = "home" | "outdoor" | "gym";
type Activity = "low" | "moderate" | "high";
type Sex = "male" | "female";

type DetectionItem = {
  class: string;
  score: number;
};

type WorkoutDay = {
  day: string;
  focus: string;
  warmup: string[];
  exercises: string[];
  rest: string;
  progression: string;
};

type ProgressEntry = {
  week: string;
  weight: number;
  waist: number;
  consistency: number;
};

type DnaAnalysis = {
  uploaded: boolean;
  markersFound: string[];
  insights: string[];
};

type ReportData = {
  calories: string;
  protein: string;
  water: string;
  summary: string[];
  bodyAnalysis: string[];
  dnaInsights: string[];
  trainingPlan: string[];
  workoutPlan: WorkoutDay[];
  nutritionPlan: string[];
  progressView: string[];
  motivation: string[];
  digitalTwinVision: string[];
  integrations: string[];
  scores: {
    composition: number;
    posture: number;
    recovery: number;
    consistency: number;
  };
};

type FormState = {
  sex: Sex;
  age: number;
  height: number;
  weight: number;
  goal: Goal;
  activity: Activity;
  trainingMode: TrainingMode;
  workoutsPerWeek: number;
};

const defaultForm: FormState = {
  sex: "male",
  age: 44,
  height: 180,
  weight: 85,
  goal: "fat_loss",
  activity: "moderate",
  trainingMode: "gym",
  workoutsPerWeek: 3,
};

const theme = {
  bg: "#09111f",
  card: "rgba(255,255,255,0.05)",
  cardStrong: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.12)",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.72)",
  soft: "rgba(255,255,255,0.55)",
  primary: "#6d5efc",
  secondary: "#14b8a6",
};

function labelGoal(goal: Goal) {
  switch (goal) {
    case "fat_loss":
      return "Fat Loss";
    case "muscle_gain":
      return "Muscle Gain";
    case "recomposition":
      return "Body Recomposition";
    case "health":
      return "General Health";
  }
}

function labelTrainingMode(mode: TrainingMode) {
  switch (mode) {
    case "home":
      return "Home Training";
    case "outdoor":
      return "Outdoor Training";
    case "gym":
      return "Gym Training";
  }
}

function labelActivity(activity: Activity) {
  switch (activity) {
    case "low":
      return "Low Activity";
    case "moderate":
      return "Moderate Activity";
    case "high":
      return "High Activity";
  }
}

function calcBmr(form: FormState) {
  const { sex, weight, height, age } = form;
  if (sex === "male") return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

function activityMultiplier(activity: Activity) {
  if (activity === "low") return 1.35;
  if (activity === "moderate") return 1.55;
  return 1.75;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function estimateBmi(weight: number, heightCm: number) {
  return weight / Math.pow(heightCm / 100, 2);
}

function estimateBodyFat(sex: Sex, bmi: number, age: number) {
  const sexFactor = sex === "male" ? 0 : 10.8;
  const estimate = 1.2 * bmi + 0.23 * age - sexFactor - 5.4;
  return clamp(Math.round(estimate), 8, 42);
}

function estimatePhysiqueType(bmi: number, goal: Goal) {
  if (bmi < 21) {
    return goal === "muscle_gain"
      ? "Lean build with good growth potential"
      : "Lean profile";
  }
  if (bmi < 26) return "Balanced profile";
  return "Higher energy reserves, recomposition potential";
}

function getProgressSeed(weight: number): ProgressEntry[] {
  return [
    { week: "Week 1", weight: Number((weight + 1.4).toFixed(1)), waist: 96, consistency: 61 },
    { week: "Week 4", weight: Number((weight + 0.7).toFixed(1)), waist: 94, consistency: 70 },
    { week: "Week 8", weight: Number((weight + 0.2).toFixed(1)), waist: 92, consistency: 77 },
    { week: "Week 12", weight: Number(weight.toFixed(1)), waist: 90, consistency: 84 },
  ];
}

function buildWorkoutPlan(
  goal: Goal,
  trainingMode: TrainingMode,
  workoutsPerWeek: number
): WorkoutDay[] {
  let plan: WorkoutDay[] = [];

  if (trainingMode === "gym") {
    if (goal === "fat_loss") {
      plan = [
        {
          day: "Monday",
          focus: "Full Body Strength A",
          warmup: ["5 min treadmill", "Hip mobility", "2 warm-up sets"],
          exercises: [
            "Squat — 4 × 8–10",
            "Bench Press — 4 × 8–10",
            "Seated Row — 4 × 10–12",
            "Romanian Deadlift — 3 × 8–10",
            "Plank — 3 × 30–45 sec",
          ],
          rest: "60–90 sec",
          progression: "Add reps first, then increase load slightly.",
        },
        {
          day: "Wednesday",
          focus: "Full Body Strength B",
          warmup: ["5 min incline walk", "Shoulder mobility"],
          exercises: [
            "Deadlift — 3 × 5–6",
            "Shoulder Press — 3 × 8–10",
            "Lat Pulldown — 4 × 10–12",
            "Walking Lunges — 3 × 10 / leg",
            "Cable Crunch — 3 × 12–15",
          ],
          rest: "75–120 sec",
          progression: "Stay clean on form before increasing load.",
        },
        {
          day: "Friday",
          focus: "Full Body + Conditioning",
          warmup: ["5 min bike", "Dynamic mobility"],
          exercises: [
            "Goblet Squat — 3 × 12",
            "Incline Dumbbell Press — 3 × 10–12",
            "Chest Supported Row — 3 × 10–12",
            "Kettlebell Swing — 3 × 12–15",
            "Incline Walk — 15–20 min",
          ],
          rest: "45–75 sec",
          progression: "Increase density and control over time.",
        },
      ];
    }

    if (goal === "muscle_gain") {
      plan = [
        {
          day: "Monday",
          focus: "Upper Body",
          warmup: ["5 min cardio", "Band warm-up"],
          exercises: [
            "Bench Press — 4 × 6–8",
            "Incline Dumbbell Press — 3 × 8–10",
            "Seated Row — 4 × 8–10",
            "Lat Pulldown — 3 × 10–12",
            "Lateral Raise — 3 × 12–15",
          ],
          rest: "60–90 sec",
          progression: "Beat reps first, then add load.",
        },
        {
          day: "Wednesday",
          focus: "Lower Body",
          warmup: ["5 min bike", "Hip + ankle mobility"],
          exercises: [
            "Squat — 4 × 6–8",
            "Romanian Deadlift — 4 × 8–10",
            "Leg Press — 3 × 10–12",
            "Hamstring Curl — 3 × 12",
            "Calf Raise — 4 × 12–15",
          ],
          rest: "75–120 sec",
          progression: "Increase load only when reps are clean.",
        },
        {
          day: "Friday",
          focus: "Upper / Full Body Pump",
          warmup: ["5 min rower", "Band pull-aparts"],
          exercises: [
            "Incline Press — 4 × 8–10",
            "Machine Row — 4 × 10–12",
            "Shoulder Press — 3 × 8–10",
            "Cable Fly — 3 × 12–15",
            "Arms Finisher — 2 rounds",
          ],
          rest: "60–90 sec",
          progression: "Use controlled tempo and chase quality reps.",
        },
      ];
    }

    if (goal === "recomposition" || goal === "health") {
      plan = [
        {
          day: "Monday",
          focus: "Strength Base",
          warmup: ["5 min cardio", "Mobility"],
          exercises: [
            "Squat — 4 × 6–8",
            "Bench Press — 4 × 6–8",
            "Row — 4 × 8–10",
            "Romanian Deadlift — 3 × 8",
            "Plank — 3 × 40 sec",
          ],
          rest: "60–90 sec",
          progression: "Slow and sustainable progression.",
        },
        {
          day: "Wednesday",
          focus: "Hypertrophy + Cardio",
          warmup: ["5 min bike", "Mobility prep"],
          exercises: [
            "Leg Press — 3 × 10–12",
            "Incline Dumbbell Press — 3 × 10–12",
            "Lat Pulldown — 3 × 10–12",
            "Lateral Raise — 3 × 15",
            "Bike / Treadmill — 20 min",
          ],
          rest: "45–75 sec",
          progression: "Improve movement quality before intensity.",
        },
        {
          day: "Friday",
          focus: "Full Body",
          warmup: ["5 min incline walk", "Dynamic prep"],
          exercises: [
            "Deadlift — 3 × 5",
            "Push-Ups — 3 × 10–12",
            "Chest Supported Row — 3 × 10",
            "Walking Lunges — 3 × 10 / leg",
            "Cable Crunch — 3 × 15",
          ],
          rest: "60–90 sec",
          progression: "Stay consistent and keep recovery manageable.",
        },
      ];
    }
  }

  if (trainingMode === "home") {
    plan = [
      {
        day: "Monday",
        focus: "Home Full Body",
        warmup: ["Walk 3 min", "Hip circles", "Arm swings"],
        exercises: [
          "Bodyweight Squat — 4 × 12–15",
          "Push-Ups — 4 × 8–12",
          "Glute Bridge — 4 × 12–15",
          "Backpack Row — 3 × 10–12",
          "Plank — 3 × 30–45 sec",
        ],
        rest: "45–60 sec",
        progression: "Add reps first, then backpack resistance.",
      },
      {
        day: "Wednesday",
        focus: "Home Lower + Core",
        warmup: ["Walk 3 min", "Mobility"],
        exercises: [
          "Reverse Lunges — 3 × 10 / leg",
          "Single-Leg Glute Bridge — 3 × 10 / leg",
          "Step-Ups — 3 × 10 / leg",
          "Calf Raises — 4 × 15–20",
          "Crunch — 3 × 15",
        ],
        rest: "45–60 sec",
        progression: "Increase reps or slow the tempo.",
      },
      {
        day: "Friday",
        focus: "Home Push + Pull",
        warmup: ["Walk 3 min", "Shoulder prep"],
        exercises: [
          "Incline Push-Ups — 3 × 10–15",
          "Backpack Row — 3 × 12",
          "Band Shoulder Press — 3 × 10",
          "Band Pull Apart — 3 × 15",
          "Low-impact cardio — 15 min",
        ],
        rest: "45–60 sec",
        progression: "Add density and reduce rest gradually.",
      },
    ];
  }

  if (trainingMode === "outdoor") {
    plan = [
      {
        day: "Monday",
        focus: "Outdoor Strength Circuit",
        warmup: ["Walk 5 min", "Mobility 5 min"],
        exercises: [
          "Bench Step-Ups — 3 × 12 / leg",
          "Incline Push-Ups — 4 × 10–12",
          "Walking Lunges — 3 × 12 / leg",
          "Pull-Up Bar Hang — 3 sets",
          "Brisk Walk — 15 min",
        ],
        rest: "45–60 sec",
        progression: "Add rounds or reps before intensity.",
      },
      {
        day: "Wednesday",
        focus: "Outdoor Cardio + Core",
        warmup: ["Walk 5 min"],
        exercises: [
          "Fast Walk / Easy Jog — 25–35 min",
          "Plank — 3 × 30–40 sec",
          "Bench Knee Raises — 3 × 15",
          "Stair or Hill Intervals — 6 rounds",
        ],
        rest: "As needed",
        progression: "Increase pace gradually.",
      },
      {
        day: "Friday",
        focus: "Outdoor Mixed Session",
        warmup: ["Walk 5 min", "Mobility"],
        exercises: [
          "Bodyweight Squat — 3 × 15",
          "Push-Ups — 3 × 10",
          "Walking Lunges — 3 × 10 / leg",
          "Hill Walk — 15–20 min",
          "Backpack Carry Walk — 10 min",
        ],
        rest: "30–45 sec",
        progression: "Add time and total work slowly.",
      },
    ];
  }

  if (workoutsPerWeek <= 2) return plan.slice(0, 2);

  if (workoutsPerWeek >= 4) {
    return [
      ...plan,
      {
        day: "Saturday",
        focus: "Bonus Recovery / Conditioning",
        warmup: ["5 min easy movement"],
        exercises: [
          "Zone 2 cardio — 25–35 min",
          "Mobility — 10 min",
          "Core work — 3 sets",
        ],
        rest: "Easy pace",
        progression: "Add time without hurting recovery.",
      },
    ];
  }

  return plan;
}

function buildNutritionPlan(goal: Goal, calories: number, protein: number, water: number) {
  const base = [
    `Calories target: ~${calories} kcal/day`,
    `Protein target: ~${protein} g/day`,
    `Water target: ~${water} L/day`,
    "Build meals around protein first, then vegetables, fruit, and quality carbs.",
  ];

  if (goal === "fat_loss") {
    return [
      ...base,
      "Use a moderate calorie deficit, not an aggressive crash diet.",
      "Prioritize satiety: lean protein, vegetables, fruit, potatoes, soups.",
      "Keep step count and sleep stable to improve compliance.",
    ];
  }

  if (goal === "muscle_gain") {
    return [
      ...base,
      "Use a controlled surplus and distribute protein across 3–5 meals.",
      "Add carbs around training to improve performance and recovery.",
      "Use progressive overload and stable meal timing.",
    ];
  }

  if (goal === "recomposition") {
    return [
      ...base,
      "Stay close to maintenance calories and keep protein high.",
      "Track photos, waist, and performance together.",
      "Keep training intensity high and food quality consistent.",
    ];
  }

  return [
    ...base,
    "Focus on stable energy, digestion, and nutrient quality.",
    "Consistency matters more than chasing perfect macros.",
    "Build habits that are easy to sustain for months, not days.",
  ];
}

async function readFileText(file: File): Promise<string> {
  return await file.text();
}

function analyzeDnaText(text: string): DnaAnalysis {
  const normalized = text.toUpperCase();

  const library = [
    {
      key: "ACTN3",
      label: "ACTN3",
      insight:
        "Power and sprint response markers detected. Strength and explosive work may respond well.",
    },
    {
      key: "ACE",
      label: "ACE",
      insight:
        "Endurance and training response markers detected. Mixed conditioning may be beneficial.",
    },
    {
      key: "FTO",
      label: "FTO",
      insight:
        "Metabolic sensitivity marker detected. Appetite and body composition response may need tighter nutrition control.",
    },
    {
      key: "PPARG",
      label: "PPARG",
      insight:
        "Fat metabolism marker detected. Dietary fat tolerance and insulin sensitivity may need individualized planning.",
    },
    {
      key: "COL1A1",
      label: "COL1A1",
      insight:
        "Connective tissue marker detected. Recovery and joint-support strategies may matter more.",
    },
    {
      key: "MTHFR",
      label: "MTHFR",
      insight:
        "Nutrient processing marker detected. Micronutrient quality and recovery habits may deserve extra attention.",
    },
    {
      key: "CYP1A2",
      label: "CYP1A2",
      insight:
        "Caffeine response marker detected. Stimulant timing may affect recovery and performance.",
    },
    {
      key: "APOE",
      label: "APOE",
      insight:
        "Lipid response marker detected. Long-term cardiovascular nutrition strategy may be relevant.",
    },
  ];

  const found = library.filter((item) => normalized.includes(item.key));
  const fallbackInsights = [
    "DNA file uploaded successfully.",
    "Structured genomics parsing is not fully enabled in this MVP.",
    "Recommendations can still use profile data, photo status, goals, and training context.",
  ];

  return {
    uploaded: true,
    markersFound: found.map((item) => item.label),
    insights: found.length > 0 ? found.map((item) => item.insight) : fallbackInsights,
  };
}

function getObjectSummary(items: DetectionItem[]) {
  if (items.length === 0) return "No objects detected yet.";
  return items.map((item) => `${item.class} (${Math.round(item.score * 100)}%)`).join(", ");
}

function smallCardStyle(): React.CSSProperties {
  return {
    background: theme.cardStrong,
    border: `1px solid ${theme.border}`,
    borderRadius: 18,
    padding: 16,
  };
}

function mainCardStyle(): React.CSSProperties {
  return {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 24px 80px rgba(0,0,0,0.24)",
    backdropFilter: "blur(14px)",
  };
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: `1px solid ${theme.border}`,
    background: "rgba(255,255,255,0.06)",
    color: theme.text,
    fontSize: 14,
    outline: "none",
  };
}

function primaryButtonStyle(): React.CSSProperties {
  return {
    border: "none",
    borderRadius: 14,
    padding: "13px 18px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    color: "white",
    background: "linear-gradient(135deg, #6d5efc 0%, #2f80ed 100%)",
  };
}

function secondaryButtonStyle(): React.CSSProperties {
  return {
    border: `1px solid ${theme.border}`,
    borderRadius: 14,
    padding: "13px 18px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    color: "white",
    background: "rgba(255,255,255,0.06)",
  };
}

function chipStyle(active?: boolean): React.CSSProperties {
  return {
    padding: "8px 12px",
    borderRadius: 999,
    background: active ? "rgba(109,94,252,0.22)" : "rgba(255,255,255,0.08)",
    border: `1px solid ${active ? "rgba(109,94,252,0.6)" : theme.border}`,
    fontSize: 12,
    fontWeight: 700,
  };
}

function hiddenInputStyle(): React.CSSProperties {
  return {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  };
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={smallCardStyle()}>
      <div style={{ fontSize: 12, color: theme.soft, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={mainCardStyle()}>
      <div style={{ color: theme.soft, fontSize: 13, marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 800, marginBottom: 12 }}>{value}/100</div>
      <div
        style={{
          height: 10,
          width: "100%",
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            borderRadius: 999,
            background: "linear-gradient(90deg, #14b8a6 0%, #6d5efc 100%)",
          }}
        />
      </div>
    </div>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <div style={mainCardStyle()}>
      <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: 20 }}>{title}</h3>
      <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 10, color: theme.muted }}>
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Page() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dnaFile, setDnaFile] = useState<File | null>(null);

  const [photoStatus, setPhotoStatus] = useState<string>("No photo analyzed yet.");
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<DetectionItem[]>([]);

  const [dnaStatus, setDnaStatus] = useState<string>("No DNA file analyzed yet.");
  const [isAnalyzingDna, setIsAnalyzingDna] = useState(false);
  const [dnaAnalysis, setDnaAnalysis] = useState<DnaAnalysis>({
    uploaded: false,
    markersFound: [],
    insights: [],
  });

  const [socialEnabled, setSocialEnabled] = useState(true);
  const [appleHealthEnabled, setAppleHealthEnabled] = useState(false);
  const [wearableEnabled, setWearableEnabled] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const dnaInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const photoLabel = useMemo(() => {
    if (!photo) return "No photo selected";
    return `${photo.name} (${Math.round(photo.size / 1024)} KB)`;
  }, [photo]);

  const dnaLabel = useMemo(() => {
    if (!dnaFile) return "No DNA file selected";
    return `${dnaFile.name} (${Math.round(dnaFile.size / 1024)} KB)`;
  }, [dnaFile]);

  const progressSeed = useMemo(() => getProgressSeed(form.weight), [form.weight]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function loadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;

    setPhotoStatus("No photo analyzed yet.");
    setDetectedObjects([]);

    if (!file) {
      if (preview) URL.revokeObjectURL(preview);
      setPhoto(null);
      setPreview(null);
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  function loadDnaFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setDnaFile(file);
    setDnaStatus("DNA file uploaded. Ready for analysis.");
    setDnaAnalysis({
      uploaded: false,
      markersFound: [],
      insights: [],
    });
  }

  async function getImageFromPreview() {
    if (!preview) throw new Error("No preview");
    const img = new Image();
    img.src = preview;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image load failed"));
    });

    return img;
  }

  async function analyzePhoto() {
    if (!preview) {
      setPhotoStatus("Upload a photo first.");
      return;
    }

    try {
      setIsAnalyzingPhoto(true);
      setPhotoStatus("AI is analyzing the image...");
      setDetectedObjects([]);

      const img = await getImageFromPreview();
      const model = await cocoSsd.load();
      const predictions = await model.detect(img);

      const cleaned: DetectionItem[] = predictions.map((p) => ({
        class: p.class,
        score: Number((p.score ?? 0).toFixed(2)),
      }));

      setDetectedObjects(cleaned);

      const personFound = cleaned.some((item) => item.class === "person");

      if (personFound) {
        setPhotoStatus("Human detected. Photo is valid for the body analysis flow.");
      } else {
        setPhotoStatus("No human detected. Please upload a clear full-body standing photo.");
      }
    } catch (error) {
      console.error(error);
      setPhotoStatus("Image analysis failed.");
    } finally {
      setIsAnalyzingPhoto(false);
    }
  }

  async function analyzeDna() {
    if (!dnaFile) {
      setDnaStatus("Upload a DNA file first.");
      return;
    }

    try {
      setIsAnalyzingDna(true);
      setDnaStatus("DNA layer is parsing the uploaded file...");

      const text = await readFileText(dnaFile);
      const result = analyzeDnaText(text);

      setDnaAnalysis(result);

      if (result.markersFound.length > 0) {
        setDnaStatus(`DNA analysis complete. ${result.markersFound.length} marker groups detected.`);
      } else {
        setDnaStatus(
          "DNA file parsed. No known demo marker keywords detected, fallback logic applied."
        );
      }
    } catch (error) {
      console.error(error);
      setDnaStatus("DNA analysis failed. Try a text-based or CSV-based file.");
    } finally {
      setIsAnalyzingDna(false);
    }
  }

  function buildReport() {
    const bmr = calcBmr(form);
    const tdee = Math.round(bmr * activityMultiplier(form.activity));

    let calories = tdee;
    if (form.goal === "fat_loss") calories = tdee - 350;
    if (form.goal === "muscle_gain") calories = tdee + 250;
    if (form.goal === "recomposition") calories = tdee - 100;

    const proteinPerKg =
      form.goal === "fat_loss"
        ? 2.1
        : form.goal === "muscle_gain"
        ? 2.0
        : form.goal === "health"
          ? 1.6
          : 1.8;

    const protein = Math.round(form.weight * proteinPerKg);
    const water = Math.max(2.2, Math.round(form.weight * 0.035 * 10) / 10);
    const bmi = estimateBmi(form.weight, form.height);
    const bodyFat = estimateBodyFat(form.sex, bmi, form.age);
    const physiqueType = estimatePhysiqueType(bmi, form.goal);

    const personDetected = detectedObjects.some((item) => item.class === "person");

    let composition = 74;
    if (form.goal === "fat_loss") composition += 2;
    if (form.goal === "muscle_gain") composition += 1;
    if (bmi > 27) composition -= 12;
    else if (bmi > 24) composition -= 6;
    else if (bmi < 20) composition -= 4;
    if (personDetected) composition += 3;

    let posture = 66;
    if (form.activity === "low") posture -= 6;
    if (form.activity === "high") posture += 2;
    if (personDetected) posture += 2;

    let recovery = 68;
    if (form.goal === "muscle_gain") recovery -= 2;
    if (form.goal === "health") recovery += 4;
    if (form.activity === "high") recovery -= 4;
    if (dnaAnalysis.uploaded) recovery += 3;
    if (dnaAnalysis.markersFound.includes("COL1A1")) recovery -= 2;
    if (dnaAnalysis.markersFound.includes("CYP1A2")) recovery += 1;

    let consistency = 70;
    if (form.trainingMode === "home") consistency += 6;
    if (form.trainingMode === "gym") consistency += 2;
    if (form.trainingMode === "outdoor") consistency += 4;
    if (socialEnabled) consistency += 3;
    if (wearableEnabled) consistency += 2;

    const scores = {
      composition: clamp(Math.round(composition), 45, 95),
      posture: clamp(Math.round(posture), 45, 95),
      recovery: clamp(Math.round(recovery), 45, 95),
      consistency: clamp(Math.round(consistency), 45, 95),
    };

    const workoutPlan = buildWorkoutPlan(form.goal, form.trainingMode, form.workoutsPerWeek);
    const nutritionPlan = buildNutritionPlan(form.goal, calories, protein, water);

    const summary = [
      `Goal selected: ${labelGoal(form.goal)}`,
      `Training environment: ${labelTrainingMode(form.trainingMode)}`,
      `Activity level: ${labelActivity(form.activity)}`,
      `Workout frequency: ${form.workoutsPerWeek} sessions per week`,
      `Estimated energy target: ~${calories} kcal/day`,
      `Protein target: ~${protein} g/day`,
      `Estimated BMI: ${bmi.toFixed(1)}`,
      `Estimated body fat: ~${bodyFat}%`,
      `Profile type: ${physiqueType}`,
    ];

    const bodyAnalysis = [
      "AI photo onboarding is enabled.",
      personDetected
        ? "A human was detected in the uploaded image."
        : "No human has been detected in the uploaded image yet.",
      `Detected objects: ${getObjectSummary(detectedObjects)}`,
      `Estimated body composition score: ${scores.composition}/100`,
      `Estimated posture score: ${scores.posture}/100`,
      `Estimated recovery score: ${scores.recovery}/100`,
      "This MVP uses heuristic estimation and image validation, not clinical body scanning.",
    ];

    const dnaInsights = dnaAnalysis.uploaded
      ? [
          "DNA file uploaded and processed.",
          ...dnaAnalysis.insights,
          dnaAnalysis.markersFound.length > 0
            ? `Marker groups recognized: ${dnaAnalysis.markersFound.join(", ")}`
            : "No demo marker keywords were recognized in the uploaded file.",
        ]
      : [
          "No DNA file analyzed yet.",
          "Current recommendations rely on profile data, goals, activity, and image status.",
        ];

    const trainingPlan = [
      `Primary goal: ${labelGoal(form.goal)}`,
      `Mode: ${labelTrainingMode(form.trainingMode)}`,
      `Activity level: ${labelActivity(form.activity)}`,
      `Schedule: ${form.workoutsPerWeek} sessions weekly`,
      "Use progressive overload with clean technique.",
      "Track energy, sleep, and soreness weekly.",
      "Use recovery-aware adjustments if performance drops for more than 7 days.",
    ];

    const progressView = [
      "Visual progress can be tracked through repeated body photos over time.",
      "Use weight, waist, and consistency together instead of relying on one metric.",
      "A future timeline can compare body changes across phases and goals.",
      "Current dashboard includes a demo progress trend for presentation purposes.",
    ];

    const motivation = socialEnabled
      ? [
          "Social layer is enabled.",
          "Optional challenges and groups can improve adherence.",
          "Community is positioned as supportive, not mandatory.",
          "Friend-based accountability can raise consistency scores over time.",
        ]
      : [
          "Solo mode is enabled.",
          "Private optimization flow is active.",
          "No social pressure, only personal tracking.",
        ];

    const digitalTwinVision = [
      "Long-term product vision: build a digital twin of the body.",
      "Future AI can evolve into real-time posture and movement coaching via camera.",
      "Adaptive engine can learn from user response, recovery, and compliance trends.",
      "Expansion roadmap: Sweden → EU → USA.",
    ];

    const integrations = [
      appleHealthEnabled
        ? "Apple Health integration is enabled in the product vision layer."
        : "Apple Health integration is not enabled.",
      wearableEnabled
        ? "Wearables layer is enabled in the product vision layer."
        : "Wearables layer is not enabled.",
      "Future integrations: Apple Health, Google Fit, wearables, recovery data sources.",
    ];

    setReport({
      calories: `~${calories} kcal/day`,
      protein: `~${protein} g/day`,
      water: `~${water} L/day`,
      summary,
      bodyAnalysis,
      dnaInsights,
      trainingPlan,
      workoutPlan,
      nutritionPlan,
      progressView,
      motivation,
      digitalTwinVision,
      integrations,
      scores,
    });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(109,94,252,0.22), transparent 35%), radial-gradient(circle at top right, rgba(20,184,166,0.14), transparent 28%), #09111f",
        color: theme.text,
        padding: 24,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        .hv-grid-hero {
          display: grid;
          grid-template-columns: 1.3fr 0.9fr;
          gap: 20px;
        }
        .hv-grid-2 {
          display: grid;
          grid-template-columns: minmax(340px, 1fr) minmax(340px, 1fr);
          gap: 18px;
        }
        .hv-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(160px, 1fr));
          gap: 18px;
        }
        .hv-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(180px, 1fr));
          gap: 18px;
        }
        .hv-grid-cards {
          display: grid;
          grid-template-columns: repeat(2, minmax(320px, 1fr));
          gap: 18px;
        }
        .hv-grid-workouts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
        }
        .hv-grid-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 1100px) {
          .hv-grid-hero,
          .hv-grid-2,
          .hv-grid-4,
          .hv-grid-3,
          .hv-grid-cards,
          .hv-grid-form {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gap: 18 }}>
        <section
          style={{
            ...mainCardStyle(),
            padding: 28,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -40,
              top: -40,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "rgba(109,94,252,0.16)",
              filter: "blur(20px)",
            }}
          />

          <div className="hv-grid-hero">
            <div>
              <div
                style={{
                  display: "inline-flex",
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  border: `1px solid ${theme.border}`,
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                HealthVision AI · Full Demo MVP
              </div>

              <h1
                style={{
                  margin: "0 0 12px",
                  fontSize: 46,
                  lineHeight: 1.03,
                  maxWidth: 840,
                }}
              >
                Personalized Health Intelligence
                <br />
                from Photo, DNA and Lifestyle Data
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: 17,
                  color: theme.muted,
                  maxWidth: 780,
                  lineHeight: 1.6,
                }}
              >
                AI-powered health and fitness platform with body-photo onboarding,
                DNA insight layer, adaptive training logic, personalized nutrition,
                progress visibility, social motivation, and digital-twin product vision.
              </p>

              <div
                style={{
                  marginTop: 22,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div style={chipStyle(true)}>Sweden → EU → USA</div>
                <div style={chipStyle()}>AI + Computer Vision + Wellness</div>
                <div style={chipStyle()}>Photo + DNA + Goals</div>
                <div style={chipStyle()}>Investor-ready MVP</div>
              </div>
            </div>

            <div className="hv-grid-form" style={{ alignSelf: "stretch" }}>
              <SmallStat label="Core Engine" value="Photo AI" />
              <SmallStat label="DNA Layer" value="DNA Ready" />
              <SmallStat label="Output" value="Personal Plans" />
              <SmallStat label="Progress" value="Visual Tracking" />
            </div>
          </div>
        </section>

        <section className="hv-grid-2">
          <div style={mainCardStyle()}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>User Profile Setup</h2>

            <div className="hv-grid-form">
              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 13, color: theme.soft }}>Sex</span>
                <select
                  value={form.sex}
                  onChange={(e) => updateField("sex", e.target.value as Sex)}
                  style={inputStyle()}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 13, color: theme.soft }}>Age</span>
                <input
                  type="number"
                  value={form.age}
                  min={18}
                  max={100}
                  onChange={(e) => updateField("age", Number(e.target.value))}
                  style={inputStyle()}
                />
              </label>

              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 13, color: theme.soft }}>Height (cm)</span>
                <input
                  type="number"
                  value={form.height}
                  min={120}
                  max={230}
                  onChange={(e) => updateField("height", Number(e.target.value))}
                  style={inputStyle()}
                />
              </label>

              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 13, color: theme.soft }}>Weight (kg)</span>
                <input
                  type="number"
                  value={form.weight}
                  min={35}
                  max={250}
                  onChange={(e) => updateField("weight", Number(e.target.value))}
                  style={inputStyle()}
                />
              </label>

              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 13, color: theme.soft }}>Goal</span>
                <select
                  value={form.goal}
                  onChange={(e) => updateField("goal", e.target.value as Goal)}
                  style={inputStyle()}
                >
                  <option value="fat_loss">Fat Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="recomposition">Body Recomposition</option>
                  <option value="health">General Health</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 13, color: theme.soft }}>Activity Level</span>
                <select
                  value={form.activity}
                  onChange={(e) => updateField("activity", e.target.value as Activity)}
                  style={inputStyle()}
                >
                  <option value="low">Low Activity</option>
                  <option value="moderate">Moderate Activity</option>
                  <option value="high">High Activity</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 13, color: theme.soft }}>Training Mode</span>
                <select
                  value={form.trainingMode}
                  onChange={(e) => updateField("trainingMode", e.target.value as TrainingMode)}
                  style={inputStyle()}
                >
                  <option value="home">Home</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="gym">Gym</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 13, color: theme.soft }}>Workouts / Week</span>
                <input
                  type="number"
                  value={form.workoutsPerWeek}
                  min={1}
                  max={6}
                  onChange={(e) => updateField("workoutsPerWeek", Number(e.target.value))}
                  style={inputStyle()}
                />
              </label>

              <div
                style={{
                  display: "grid",
                  gap: 10,
                  alignContent: "end",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${theme.border}`,
                    borderRadius: 16,
                    padding: "12px 14px",
                    minHeight: 48,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={socialEnabled}
                    onChange={(e) => setSocialEnabled(e.target.checked)}
                  />
                  <span style={{ fontSize: 14 }}>Enable social motivation layer</span>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${theme.border}`,
                    borderRadius: 16,
                    padding: "12px 14px",
                    minHeight: 48,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={appleHealthEnabled}
                    onChange={(e) => setAppleHealthEnabled(e.target.checked)}
                  />
                  <span style={{ fontSize: 14 }}>Enable Apple Health layer</span>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${theme.border}`,
                    borderRadius: 16,
                    padding: "12px 14px",
                    minHeight: 48,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={wearableEnabled}
                    onChange={(e) => setWearableEnabled(e.target.checked)}
                  />
                  <span style={{ fontSize: 14 }}>Enable wearable input layer</span>
                </label>
              </div>
            </div>
          </div>

          <div style={mainCardStyle()}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Photo + DNA Intake</h2>

            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 13, color: theme.soft }}>Upload body photo</span>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={loadPhoto}
                  style={hiddenInputStyle()}
                />

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    style={secondaryButtonStyle()}
                  >
                    Upload Photo
                  </button>

                  <div style={{ fontSize: 13, color: theme.muted }}>{photoLabel}</div>
                </div>
              </div>

              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: 300,
                    objectFit: "cover",
                    borderRadius: 20,
                    border: `1px solid ${theme.border}`,
                  }}
                />
              ) : (
                <div
                  style={{
                    height: 300,
                    borderRadius: 20,
                    border: `1px dashed ${theme.border}`,
                    display: "grid",
                    placeItems: "center",
                    color: theme.soft,
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  No image preview yet
                </div>
              )}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={analyzePhoto}
                  disabled={isAnalyzingPhoto}
                  style={{
                    ...secondaryButtonStyle(),
                    opacity: isAnalyzingPhoto ? 0.7 : 1,
                    cursor: isAnalyzingPhoto ? "not-allowed" : "pointer",
                  }}
                >
                  {isAnalyzingPhoto ? "Analyzing..." : "Analyze Photo"}
                </button>

                <button type="button" onClick={buildReport} style={primaryButtonStyle()}>
                  Generate Health Report
                </button>
              </div>

              <div style={{ fontSize: 14, color: theme.muted }}>{photoStatus}</div>

              {detectedObjects.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${theme.border}`,
                    borderRadius: 18,
                    padding: 12,
                  }}
                >
                  {detectedObjects.map((item, index) => (
                    <div key={`${item.class}-${index}`} style={chipStyle()}>
                      {item.class} · {Math.round(item.score * 100)}%
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: 13, color: theme.soft }}>Upload DNA file</span>

                <input
                  ref={dnaInputRef}
                  type="file"
                  accept=".txt,.csv,.json"
                  onChange={loadDnaFile}
                  style={hiddenInputStyle()}
                />

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => dnaInputRef.current?.click()}
                    style={secondaryButtonStyle()}
                  >
                    Upload DNA File
                  </button>

                  <div style={{ fontSize: 13, color: theme.muted }}>{dnaLabel}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={analyzeDna}
                  disabled={isAnalyzingDna}
                  style={{
                    ...secondaryButtonStyle(),
                    opacity: isAnalyzingDna ? 0.7 : 1,
                    cursor: isAnalyzingDna ? "not-allowed" : "pointer",
                  }}
                >
                  {isAnalyzingDna ? "Parsing DNA..." : "Analyze DNA"}
                </button>
              </div>

              <div style={{ fontSize: 14, color: theme.muted }}>{dnaStatus}</div>

              {dnaAnalysis.markersFound.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${theme.border}`,
                    borderRadius: 18,
                    padding: 12,
                  }}
                >
                  {dnaAnalysis.markersFound.map((marker) => (
                    <div key={marker} style={chipStyle(true)}>
                      {marker}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {report && (
          <>
            <section className="hv-grid-4">
              <ScoreCard label="Body Composition" value={report.scores.composition} />
              <ScoreCard label="Posture" value={report.scores.posture} />
              <ScoreCard label="Recovery" value={report.scores.recovery} />
              <ScoreCard label="Consistency" value={report.scores.consistency} />
            </section>

            <section className="hv-grid-3">
              <SmallStat label="Calories Target" value={report.calories} />
              <SmallStat label="Protein Target" value={report.protein} />
              <SmallStat label="Water Target" value={report.water} />
            </section>

            <section className="hv-grid-cards">
              <ReportList title="Executive Summary" items={report.summary} />
              <ReportList title="Body Analysis" items={report.bodyAnalysis} />
              <ReportList title="DNA Insights" items={report.dnaInsights} />
              <ReportList title="Training Plan" items={report.trainingPlan} />
              <ReportList title="Nutrition Plan" items={report.nutritionPlan} />
              <ReportList title="Progress View" items={report.progressView} />
              <ReportList title="Motivation Layer" items={report.motivation} />
              <ReportList title="Digital Twin Vision" items={report.digitalTwinVision} />
              <ReportList title="Integrations" items={report.integrations} />
            </section>

            <section style={mainCardStyle()}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: 18,
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>Weekly Workout Plan</h2>
                  <p style={{ margin: "6px 0 0", color: theme.muted }}>
                    Personalized weekly structure based on goal and training mode
                  </p>
                </div>

                <div style={chipStyle(true)}>
                  {labelGoal(form.goal)} · {labelTrainingMode(form.trainingMode)}
                </div>
              </div>

              <div className="hv-grid-workouts">
                {report.workoutPlan.map((day) => (
                  <div
                    key={`${day.day}-${day.focus}`}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${theme.border}`,
                      borderRadius: 20,
                      padding: 18,
                    }}
                  >
                    <div style={{ fontSize: 12, color: theme.soft, marginBottom: 8 }}>{day.day}</div>
                    <h3 style={{ margin: "0 0 12px", fontSize: 20 }}>{day.focus}</h3>

                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Warm-up</div>
                    <ul style={{ paddingLeft: 18, marginTop: 0, color: theme.muted }}>
                      {day.warmup.map((item, idx) => (
                        <li key={`warmup-${day.day}-${idx}`}>{item}</li>
                      ))}
                    </ul>

                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Exercises</div>
                    <ul style={{ paddingLeft: 18, marginTop: 0, color: theme.muted }}>
                      {day.exercises.map((item, idx) => (
                        <li key={`exercise-${day.day}-${idx}`}>{item}</li>
                      ))}
                    </ul>

                    <div style={{ marginTop: 10, fontSize: 14, color: theme.muted }}>
                      <strong style={{ color: "white" }}>Rest:</strong> {day.rest}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 14, color: theme.muted }}>
                      <strong style={{ color: "white" }}>Progression:</strong> {day.progression}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={mainCardStyle()}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: 18,
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>Progress Dashboard</h2>
                  <p style={{ margin: "6px 0 0", color: theme.muted }}>
                    Demo visualization of weight, waist and consistency trend
                  </p>
                </div>
                <div style={chipStyle()}>Visual Progress Layer</div>
              </div>

              <div className="hv-grid-3">
                {progressSeed.map((entry) => (
                  <div key={entry.week} style={smallCardStyle()}>
                    <div style={{ fontSize: 12, color: theme.soft, marginBottom: 10 }}>{entry.week}</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={{ color: theme.muted }}>
                        <strong style={{ color: "white" }}>Weight:</strong> {entry.weight} kg
                      </div>
                      <div style={{ color: theme.muted }}>
                        <strong style={{ color: "white" }}>Waist:</strong> {entry.waist} cm
                      </div>
                      <div style={{ color: theme.muted }}>
                        <strong style={{ color: "white" }}>Consistency:</strong> {entry.consistency}/100
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                        height: 8,
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.08)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${entry.consistency}%`,
                          background: "linear-gradient(90deg, #14b8a6 0%, #6d5efc 100%)",
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={mainCardStyle()}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: 18,
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>Platform Capabilities Overview</h2>
                  <p style={{ margin: "6px 0 0", color: theme.muted }}>
                    Feature mapping aligned with the product vision
                  </p>
                </div>
                <div style={chipStyle(true)}>Concept → Demo MVP</div>
              </div>

              <div className="hv-grid-cards">
                <div style={smallCardStyle()}>
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>1. AI Body Analysis</div>
                  <div style={{ color: theme.muted, lineHeight: 1.6 }}>
                    Photo intake, person validation, object detection, score estimation, and
                    body-profile heuristics.
                  </div>
                </div>

                <div style={smallCardStyle()}>
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>2. DNA Insights</div>
                  <div style={{ color: theme.muted, lineHeight: 1.6 }}>
                    DNA file intake, demo marker parsing, response logic for recovery, metabolism,
                    and training style suggestions.
                  </div>
                </div>

                <div style={smallCardStyle()}>
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>3. Personalized Plans</div>
                  <div style={{ color: theme.muted, lineHeight: 1.6 }}>
                    Goal-based calories, protein targets, training split generation, and adaptive
                    recommendations layer.
                  </div>
                </div>

                <div style={smallCardStyle()}>
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>4. Any Environment</div>
                  <div style={{ color: theme.muted, lineHeight: 1.6 }}>
                    Home, outdoor, and gym training modes with tailored workouts and progression
                    logic.
                  </div>
                </div>

                <div style={smallCardStyle()}>
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>5. Visual Progress</div>
                  <div style={{ color: theme.muted, lineHeight: 1.6 }}>
                    Demo progress dashboard for weight, waist, consistency, and future body-photo
                    timeline view.
                  </div>
                </div>

                <div style={smallCardStyle()}>
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>6. Social Ecosystem</div>
                  <div style={{ color: theme.muted, lineHeight: 1.6 }}>
                    Optional motivation layer with friend/accountability positioning and
                    community-ready concept.
                  </div>
                </div>

                <div style={smallCardStyle()}>
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>7. Integrations</div>
                  <div style={{ color: theme.muted, lineHeight: 1.6 }}>
                    Product hooks for Apple Health, wearables, future Google Fit and recovery data
                    sources.
                  </div>
                </div>

                <div style={smallCardStyle()}>
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>8. Market Vision</div>
                  <div style={{ color: theme.muted, lineHeight: 1.6 }}>
                    Sweden → EU → USA with long-term digital twin and real-time coaching roadmap.
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}