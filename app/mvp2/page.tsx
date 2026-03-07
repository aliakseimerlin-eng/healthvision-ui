"use client";

import React, { useEffect, useMemo, useState } from "react";

type Goal = "fat_loss" | "muscle_gain" | "health";
type TrainingMode = "gym" | "home" | "outdoor";

type ProgressEntry = {
  date: string;
  weight: number;
  postureScore: number;
  symmetryScore: number;
  bodyScore: number;
  bodyAge: number;
  weeklyInsight: string;
  summary: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function scorePosture(weight: number, mode: TrainingMode) {
  let base = 78 - (weight - 80) * 0.35;

  if (mode === "gym") base += 2;
  if (mode === "home") base += 1;
  if (mode === "outdoor") base += 3;

  return Math.round(clamp(base, 55, 95));
}

function scoreSymmetry(weight: number, mode: TrainingMode) {
  let base = 80 - (weight - 80) * 0.2;

  if (mode === "outdoor") base += 2;

  return Math.round(clamp(base, 60, 94));
}

function scoreBody(postureScore: number, symmetryScore: number) {
  return Math.round((postureScore + symmetryScore) / 2);
}

function calculateBodyAge(bodyScore: number, weight: number) {
  let age = 44;

  if (bodyScore >= 88) age -= 8;
  else if (bodyScore >= 82) age -= 5;
  else if (bodyScore >= 76) age -= 2;
  else if (bodyScore <= 68) age += 4;

  if (weight > 95) age += 2;
  if (weight < 80) age -= 1;

  return clamp(Math.round(age), 28, 58);
}

function buildWeeklyInsight(
  goal: Goal,
  bodyScore: number,
  postureScore: number,
  symmetryScore: number
) {
  if (goal === "fat_loss") {
    if (bodyScore >= 80) {
      return "Strong week for fat-loss positioning. Keep daily activity high and stay consistent with strength work.";
    }
    return "You have room to improve body composition. Focus on walking, recovery, and calorie discipline this week.";
  }

  if (goal === "muscle_gain") {
    if (postureScore >= 78 && symmetryScore >= 78) {
      return "Your body is in a good state to push progressive overload this week.";
    }
    return "Before pushing harder loads, improve body balance and movement quality.";
  }

  if (bodyScore >= 80) {
    return "You are in a stable range. Build consistency and protect recovery.";
  }

  return "Focus on movement quality, sleep, hydration, and regular training this week.";
}

function buildWorkout(goal: Goal, mode: TrainingMode) {
  if (goal === "fat_loss") {
    if (mode === "gym") {
      return [
        "Squat — 4 x 8-10",
        "Incline dumbbell press — 3 x 10",
        "Lat pulldown — 4 x 10-12",
        "Romanian deadlift — 3 x 8-10",
        "Incline treadmill walk — 20 min",
      ];
    }

    if (mode === "home") {
      return [
        "Bodyweight squats — 4 x 15",
        "Push-ups — 4 x 10-15",
        "Walking lunges — 3 x 12 / leg",
        "Plank — 3 x 40 sec",
        "Fast walk — 25 min",
      ];
    }

    return [
      "Outdoor walk — 30 min",
      "Hill walk intervals — 10 min",
      "Bodyweight squats — 3 x 15",
      "Bench push-ups — 3 x 12",
      "Standing core bracing — 3 rounds",
    ];
  }

  if (goal === "muscle_gain") {
    if (mode === "gym") {
      return [
        "Bench press — 4 x 6-8",
        "Barbell row — 4 x 8-10",
        "Shoulder press — 3 x 8-10",
        "Romanian deadlift — 4 x 8",
        "Pull-ups or pulldown — 3 x 8-10",
      ];
    }

    if (mode === "home") {
      return [
        "Backpack squats — 4 x 12",
        "Push-ups — 4 x 12",
        "Backpack rows — 4 x 12",
        "Split squats — 3 x 10 / leg",
        "Plank — 3 x 45 sec",
      ];
    }

    return [
      "Pull-up bar hangs — 4 sets",
      "Push-ups — 4 x 12",
      "Walking lunges — 4 x 12 / leg",
      "Backpack carry — 10 min",
      "Hill sprint walk — 8 rounds",
    ];
  }

  if (mode === "gym") {
    return [
      "Mobility flow — 10 min",
      "Leg press — 3 x 12",
      "Chest press — 3 x 12",
      "Seated row — 3 x 12",
      "Walk — 20 min",
    ];
  }

  if (mode === "home") {
    return [
      "Mobility flow — 10 min",
      "Bodyweight squats — 3 x 12",
      "Push-ups — 3 x 10",
      "Light rows — 3 x 12",
      "Walk — 30 min",
    ];
  }

  return [
    "Outdoor walk — 35 min",
    "Mobility flow — 10 min",
    "Bodyweight squats — 3 x 15",
    "Bench push-ups — 3 x 12",
    "Breathing reset — 5 min",
  ];
}

function buildNutrition(goal: Goal) {
  if (goal === "fat_loss") {
    return [
      "Moderate calorie deficit",
      "Protein in every meal",
      "Vegetables and fruit daily",
      "Avoid liquid calories",
    ];
  }

  if (goal === "muscle_gain") {
    return [
      "Small calorie surplus",
      "Protein around 2 g/kg",
      "Carbs around training",
      "Consistent meal timing",
    ];
  }

  return [
    "Balanced meals",
    "Whole foods first",
    "Good hydration",
    "Stable routine and sleep",
  ];
}

export default function MVP2Page() {
  const [weight, setWeight] = useState(85);
  const [goal, setGoal] = useState<Goal>("fat_loss");
  const [mode, setMode] = useState<TrainingMode>("gym");

  const [history, setHistory] = useState<ProgressEntry[]>([]);
  const [photoName, setPhotoName] = useState("No photo selected");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("healthvision_mvp2_history");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as ProgressEntry[];
      setHistory(parsed);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("healthvision_mvp2_history", JSON.stringify(history));
  }, [history]);

  const latest = history[history.length - 1];
  const previous = history[history.length - 2];

  const workout = useMemo(() => buildWorkout(goal, mode), [goal, mode]);
  const nutrition = useMemo(() => buildNutrition(goal), [goal]);

  function generateReport() {
    const postureScore = scorePosture(weight, mode);
    const symmetryScore = scoreSymmetry(weight, mode);
    const bodyScore = scoreBody(postureScore, symmetryScore);
    const bodyAge = calculateBodyAge(bodyScore, weight);

    let summary =
      "Body alignment looks stable. Focus on consistency, core strength, and progressive training.";

    if (goal === "fat_loss") {
      summary =
        "Main opportunity is body composition improvement. Focus on fat loss, walking, and strength training.";
    }

    if (goal === "muscle_gain") {
      summary =
        "Main opportunity is lean mass gain. Prioritize progressive overload, recovery, and protein intake.";
    }

    if (goal === "health") {
      summary =
        "Main opportunity is sustainable health. Focus on movement quality, posture, recovery, and regular activity.";
    }

    const weeklyInsight = buildWeeklyInsight(
      goal,
      bodyScore,
      postureScore,
      symmetryScore
    );

    const entry: ProgressEntry = {
      date: new Date().toLocaleString(),
      weight,
      postureScore,
      symmetryScore,
      bodyScore,
      bodyAge,
      weeklyInsight,
      summary,
    };

    setHistory((prev) => [...prev, entry]);
  }

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      setPhotoName("No photo selected");
      setPhotoPreview(null);
      return;
    }

    setPhotoName(file.name);

    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }

  function shareResult() {
    if (!latest) return;

    const text = `My HealthVision AI Body Score is ${latest.bodyScore}/100. My AI Body Age is ${latest.bodyAge}. Posture ${latest.postureScore}/100, Symmetry ${latest.symmetryScore}/100.`;

    navigator.clipboard.writeText(text);
    alert("Result copied. Share it!");
  }

  const progressText = useMemo(() => {
    if (!latest || !previous) {
      return "No comparison yet. Generate at least two reports.";
    }

    const postureDiff = latest.postureScore - previous.postureScore;
    const symmetryDiff = latest.symmetryScore - previous.symmetryScore;
    const bodyDiff = latest.bodyScore - previous.bodyScore;
    const ageDiff = latest.bodyAge - previous.bodyAge;
    const weightDiff = latest.weight - previous.weight;

    return `Weight: ${weightDiff >= 0 ? "+" : ""}${weightDiff} kg | Posture: ${
      postureDiff >= 0 ? "+" : ""
    }${postureDiff} | Symmetry: ${symmetryDiff >= 0 ? "+" : ""}${symmetryDiff} | Body score: ${
      bodyDiff >= 0 ? "+" : ""
    }${bodyDiff} | Body age: ${ageDiff >= 0 ? "+" : ""}${ageDiff}`;
  }, [latest, previous]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(37,99,235,0.22), transparent 32%), #0b1220",
        color: "white",
        padding: 32,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ marginBottom: 8 }}>HealthVision AI — MVP 2</h1>
          <p style={{ opacity: 0.82, marginTop: 0 }}>
            Progress Vision, AI body scoring, body age, workout guidance, and nutrition suggestions.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginTop: 24,
          }}
        >
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>User Inputs</h2>

            <div style={{ display: "grid", gap: 14 }}>
              <label>
                <div style={labelStyle}>Weight (kg)</div>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  style={inputStyle}
                />
              </label>

              <label>
                <div style={labelStyle}>Goal</div>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as Goal)}
                  style={inputStyle}
                >
                  <option value="fat_loss">Fat Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="health">General Health</option>
                </select>
              </label>

              <label>
                <div style={labelStyle}>Training Mode</div>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as TrainingMode)}
                  style={inputStyle}
                >
                  <option value="gym">Gym</option>
                  <option value="home">Home</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </label>

              <label>
                <div style={labelStyle}>Body Photo</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPhotoChange}
                  style={inputStyle}
                />
              </label>

              <div style={{ fontSize: 13, opacity: 0.8 }}>{photoName}</div>

              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Body preview"
                  style={{
                    width: 220,
                    maxWidth: "100%",
                    borderRadius: 14,
                    border: "1px solid #334155",
                  }}
                />
              )}

              <button onClick={generateReport} style={buttonStyle}>
                Generate AI Progress Report
              </button>
            </div>
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>AI Progress Vision</h2>

            {!latest ? (
              <p style={{ opacity: 0.8 }}>
                No report yet. Generate the first report to create your baseline.
              </p>
            ) : (
              <>
                <p>
                  <strong>Latest entry:</strong> {latest.date}
                </p>
                <p>
                  <strong>Weight:</strong> {latest.weight} kg
                </p>
                <p>
                  <strong>Posture score:</strong> {latest.postureScore}/100
                </p>
                <p>
                  <strong>Symmetry score:</strong> {latest.symmetryScore}/100
                </p>
                <p>
                  <strong>Body score:</strong> {latest.bodyScore}/100
                </p>
                <p>
                  <strong>AI Body Age:</strong> {latest.bodyAge}
                </p>
                <p>
                  <strong>AI summary:</strong> {latest.summary}
                </p>

                <div style={subCardStyle}>
                  <strong>Weekly Progress AI</strong>
                  <div style={{ marginTop: 8 }}>{latest.weeklyInsight}</div>
                </div>

                <div style={subCardStyle}>
                  <strong>Comparison</strong>
                  <div style={{ marginTop: 8 }}>{progressText}</div>
                </div>

                <button onClick={shareResult} style={{ ...buttonStyle, marginTop: 14 }}>
                  Share My AI Body Score
                </button>
              </>
            )}
          </section>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginTop: 20,
          }}
        >
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Workout Guidance</h2>
            <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
              {workout.map((item, i) => (
                <li key={i} style={{ marginBottom: 8 }}>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Nutrition Guidance</h2>
            <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
              {nutrition.map((item, i) => (
                <li key={i} style={{ marginBottom: 8 }}>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section style={{ ...cardStyle, marginTop: 20 }}>
          <h2 style={{ marginTop: 0 }}>Progress History</h2>

          {history.length === 0 ? (
            <p style={{ opacity: 0.8 }}>No progress history yet.</p>
          ) : (
            <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
              {history.map((entry, i) => (
                <li key={i} style={{ marginBottom: 10 }}>
                  {entry.date} — {entry.weight} kg — posture {entry.postureScore} — symmetry{" "}
                  {entry.symmetryScore} — body score {entry.bodyScore} — body age {entry.bodyAge}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={{ ...cardStyle, marginTop: 20 }}>
          <h2 style={{ marginTop: 0 }}>What comes next</h2>
          <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
            <li style={{ marginBottom: 8 }}>Real pose detection from body photo</li>
            <li style={{ marginBottom: 8 }}>Saved user accounts</li>
            <li style={{ marginBottom: 8 }}>Subscription payments</li>
            <li style={{ marginBottom: 8 }}>Weekly AI coaching summaries</li>
          </ul>
        </section>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: "rgba(18,26,43,0.92)",
  border: "1px solid #26324a",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const subCardStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  background: "#0f1727",
  border: "1px solid #26324a",
};

const labelStyle: React.CSSProperties = {
  marginBottom: 6,
  fontSize: 14,
  opacity: 0.9,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#0f1727",
  color: "white",
};

const buttonStyle: React.CSSProperties = {
  marginTop: 10,
  padding: "12px 16px",
  borderRadius: 10,
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};