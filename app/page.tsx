"use client";

import React, { useMemo, useState } from "react";

type Goal = "fat_loss" | "muscle_gain" | "recomposition" | "health";
type Sex = "male" | "female";
type Activity = "low" | "moderate" | "high";
type TrainingMode = "gym" | "home" | "outdoor";

type FormState = {
  sex: Sex;
  age: number;
  height: number;
  weight: number;
  goal: Goal;
  activity: Activity;
  workoutsPerWeek: number;
  bloodType: string;
  trainingMode: TrainingMode;
};

type WorkoutDay = {
  day: string;
  focus: string;
  warmup: string[];
  exercises: string[];
  rest: string;
  progression: string;
  substitutions: string[];
};

type AnalysisResult = {
  photoInsights: string[];
  bodySummary: string[];
  training: string[];
  workoutPlan: WorkoutDay[];
  nutrition: string[];
  mealStructure: string[];
  lifestyle: string[];
  calories: string;
  protein: string;
  water: string;
  scores: {
    composition: number;
    strength: number;
    posture: number;
    recovery: number;
  };
};

const defaultForm: FormState = {
  sex: "male",
  age: 44,
  height: 180,
  weight: 85,
  goal: "fat_loss",
  activity: "moderate",
  workoutsPerWeek: 3,
  bloodType: "",
  trainingMode: "gym",
};

function labelGoal(goal: Goal) {
  switch (goal) {
    case "fat_loss":
      return "Fat Loss";
    case "muscle_gain":
      return "Muscle Gain";
    case "recomposition":
      return "Recomposition";
    case "health":
      return "General Health";
  }
}

function labelTrainingMode(mode: TrainingMode) {
  switch (mode) {
    case "gym":
      return "Gym";
    case "home":
      return "Home";
    case "outdoor":
      return "Outdoor";
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

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num));
}

function buildWorkoutPlan(
  goal: Goal,
  workoutsPerWeek: number,
  trainingMode: TrainingMode
): WorkoutDay[] {
  const gymFatLoss: WorkoutDay[] = [
    {
      day: "Monday",
      focus: "Full Body Strength A",
      warmup: [
        "5 min treadmill / bike",
        "Hip mobility 2 min",
        "2 warm-up sets before first compound lift",
      ],
      exercises: [
        "Squat or Leg Press — 4 sets × 8–10 reps",
        "Bench Press or Push-Ups — 4 sets × 8–12 reps",
        "Seated Row or Dumbbell Row — 4 sets × 10–12 reps",
        "Romanian Deadlift — 3 sets × 8–10 reps",
        "Plank — 3 sets × 30–45 sec",
      ],
      rest: "60–90 sec between most sets, 90–120 sec on heavy compounds",
      progression:
        "When you complete all target reps with solid form, increase the load next session by 2.5–5 kg.",
      substitutions: [
        "Bench Press → Machine Press / Push-Ups",
        "Squat → Leg Press / Goblet Squat",
      ],
    },
    {
      day: "Wednesday",
      focus: "Full Body Strength B",
      warmup: [
        "5 min incline walk",
        "Thoracic rotation and shoulder mobility",
        "1–2 lighter ramp-up sets",
      ],
      exercises: [
        "Deadlift or Trap Bar Deadlift — 3 sets × 5–6 reps",
        "Shoulder Press — 3 sets × 8–10 reps",
        "Lat Pulldown or Assisted Pull-Ups — 4 sets × 10–12 reps",
        "Walking Lunges — 3 sets × 10 reps/leg",
        "Cable Crunch or Leg Raises — 3 sets × 12–15 reps",
        "20 min incline walk or bike",
      ],
      rest: "75–120 sec on compounds, 45–60 sec on abs",
      progression:
        "Add reps first inside the target range, then increase weight once top reps feel controlled.",
      substitutions: [
        "Deadlift → Romanian Deadlift / Back Extension",
        "Lat Pulldown → Seated Row",
      ],
    },
    {
      day: "Friday",
      focus: "Full Body + Conditioning",
      warmup: [
        "5 min bike or rower",
        "Dynamic squat + hip hinge prep",
      ],
      exercises: [
        "Goblet Squat — 3 sets × 12 reps",
        "Incline Dumbbell Press — 3 sets × 10–12 reps",
        "Chest-Supported Row — 3 sets × 10–12 reps",
        "Kettlebell Swing or Hip Hinge — 3 sets × 12–15 reps",
        "Farmer Carry — 3 rounds × 30–40 m",
        "Conditioning: 15–20 min moderate cardio",
      ],
      rest: "45–75 sec on accessories, 60 sec between carries",
      progression:
        "Increase reps first, then load. Keep the conditioning moderate, not maximal.",
      substitutions: [
        "Farmer Carry → Treadmill incline walk",
        "Swing → Romanian Deadlift light",
      ],
    },
  ];

  const gymMuscle: WorkoutDay[] = [
    {
      day: "Monday",
      focus: "Upper Body",
      warmup: ["5 min cardio", "Band shoulder warm-up", "2 warm-up sets first press"],
      exercises: [
        "Bench Press — 4 sets × 6–8 reps",
        "Incline Dumbbell Press — 3 sets × 8–10 reps",
        "Seated Row — 4 sets × 8–10 reps",
        "Lat Pulldown — 3 sets × 10–12 reps",
        "Lateral Raises — 3 sets × 12–15 reps",
        "Biceps Curl + Triceps Pushdown — 3 sets × 12 reps each",
      ],
      rest: "90 sec on main lifts, 45–60 sec on isolation",
      progression:
        "Push for more reps week to week, then raise load once all sets hit upper rep target.",
      substitutions: [
        "Bench Press → Machine Chest Press",
        "Lat Pulldown → Assisted Pull-Up",
      ],
    },
    {
      day: "Wednesday",
      focus: "Lower Body",
      warmup: ["5 min bike", "Hip and ankle mobility", "2 ramp-up sets"],
      exercises: [
        "Squat or Hack Squat — 4 sets × 6–8 reps",
        "Romanian Deadlift — 4 sets × 8–10 reps",
        "Leg Press — 3 sets × 10–12 reps",
        "Hamstring Curl — 3 sets × 12 reps",
        "Calf Raises — 4 sets × 12–15 reps",
        "Hanging Knee Raises — 3 sets × 12 reps",
      ],
      rest: "90–120 sec on squats/RDL, 45–60 sec on accessories",
      progression:
        "Prioritize form and depth. Add load only when all reps are consistent.",
      substitutions: [
        "Hack Squat → Leg Press",
        "Romanian Deadlift → Dumbbell RDL",
      ],
    },
    {
      day: "Friday",
      focus: "Upper / Full Body Pump",
      warmup: ["5 min rower", "Band pull-aparts", "1 lighter first set per main movement"],
      exercises: [
        "Incline Press — 4 sets × 8–10 reps",
        "Machine Row — 4 sets × 10–12 reps",
        "Shoulder Press — 3 sets × 8–10 reps",
        "Cable Fly — 3 sets × 12–15 reps",
        "Rear Delt Fly — 3 sets × 12–15 reps",
        "Arms Finisher — 2–3 rounds",
      ],
      rest: "60–90 sec",
      progression:
        "Use controlled tempo, chase good contractions, and add reps before load.",
      substitutions: [
        "Cable Fly → Dumbbell Fly",
        "Machine Row → Chest-Supported Row",
      ],
    },
  ];

  const gymRecomp: WorkoutDay[] = [
    {
      day: "Monday",
      focus: "Strength Base",
      warmup: ["5 min cardio", "Hip mobility", "2 warm-up sets"],
      exercises: [
        "Squat — 4 sets × 6–8 reps",
        "Bench Press — 4 sets × 6–8 reps",
        "Row — 4 sets × 8–10 reps",
        "Romanian Deadlift — 3 sets × 8 reps",
        "Plank — 3 sets × 40 sec",
      ],
      rest: "75–120 sec",
      progression:
        "Progress slowly but steadily. Keep 1–2 reps in reserve on main lifts.",
      substitutions: [
        "Bench Press → Push-Ups weighted / Machine Press",
        "Row → Cable Row",
      ],
    },
    {
      day: "Wednesday",
      focus: "Hypertrophy + Cardio",
      warmup: ["5 min bike", "Shoulder + hip prep"],
      exercises: [
        "Leg Press — 3 sets × 10–12 reps",
        "Incline Dumbbell Press — 3 sets × 10–12 reps",
        "Lat Pulldown — 3 sets × 10–12 reps",
        "Lateral Raises — 3 sets × 15 reps",
        "Bike or treadmill — 20 min moderate pace",
      ],
      rest: "45–75 sec",
      progression:
        "Add reps and improve movement quality before increasing weight.",
      substitutions: [
        "Leg Press → Goblet Squat",
        "Lat Pulldown → Seated Row",
      ],
    },
    {
      day: "Friday",
      focus: "Full Body",
      warmup: ["5 min incline walk", "Dynamic movement prep"],
      exercises: [
        "Deadlift — 3 sets × 5 reps",
        "Push-Ups or Assisted Dips — 3 sets × 10–12 reps",
        "Chest Supported Row — 3 sets × 10 reps",
        "Walking Lunges — 3 sets × 10 reps/leg",
        "Cable Crunch — 3 sets × 15 reps",
      ],
      rest: "60–90 sec",
      progression:
        "Keep execution sharp. Add load gradually without compromising form.",
      substitutions: [
        "Deadlift → Romanian Deadlift",
        "Dips → Push-Ups",
      ],
    },
  ];

  const gymHealth: WorkoutDay[] = [
    {
      day: "Monday",
      focus: "Full Body Strength",
      warmup: ["5 min treadmill", "Joint mobility 5 min"],
      exercises: [
        "Goblet Squat — 3 sets × 10 reps",
        "Push-Ups — 3 sets × 8–12 reps",
        "Row Machine or Cable Row — 3 sets × 10 reps",
        "Romanian Deadlift — 3 sets × 10 reps",
        "Plank — 3 sets × 30 sec",
      ],
      rest: "45–75 sec",
      progression:
        "Build smooth consistency first. Increase reps before weight.",
      substitutions: [
        "Push-Ups → Machine Chest Press",
        "Goblet Squat → Leg Press",
      ],
    },
    {
      day: "Wednesday",
      focus: "Mobility + Cardio",
      warmup: ["Light walk 5 min"],
      exercises: [
        "Mobility flow — 10–15 min",
        "Walking or bike — 25–35 min",
        "Bodyweight Split Squat — 3 sets × 10 reps/leg",
        "Band Pull Aparts — 3 sets × 15 reps",
        "Breathing / cool-down — 5 min",
      ],
      rest: "30–45 sec",
      progression:
        "Increase total time and quality of movement before intensity.",
      substitutions: [
        "Bike → Incline walk",
        "Split Squat → Step-Ups",
      ],
    },
    {
      day: "Friday",
      focus: "Strength + Conditioning",
      warmup: ["5 min bike", "Basic mobility"],
      exercises: [
        "Leg Press or Squat — 3 sets × 8–10 reps",
        "Shoulder Press — 3 sets × 8–10 reps",
        "Lat Pulldown — 3 sets × 10–12 reps",
        "Farmer Carry — 3 rounds",
        "Treadmill incline walk — 15–20 min",
      ],
      rest: "60–75 sec",
      progression:
        "Aim for easier recovery and repeatability, not maximal fatigue.",
      substitutions: [
        "Farmer Carry → Sled push / incline walk",
        "Lat Pulldown → Seated Row",
      ],
    },
  ];

  const homeBase: Record<Goal, WorkoutDay[]> = {
    fat_loss: [
      {
        day: "Monday",
        focus: "Home Full Body A",
        warmup: ["March in place 2–3 min", "Hip circles", "Arm swings"],
        exercises: [
          "Bodyweight Squat — 4 sets × 12–15 reps",
          "Push-Ups (or knees) — 4 sets × 8–12 reps",
          "Glute Bridge — 4 sets × 12–15 reps",
          "Chair Row / Backpack Row — 3 sets × 10–12 reps",
          "Plank — 3 sets × 30–45 sec",
        ],
        rest: "45–60 sec",
        progression: "Add reps first, then add backpack resistance.",
        substitutions: [
          "Push-Ups → Incline Push-Ups",
          "Backpack Row → Band Row",
        ],
      },
      {
        day: "Wednesday",
        focus: "Home Full Body B",
        warmup: ["Walk 3 min", "Dynamic lunges", "Shoulder rolls"],
        exercises: [
          "Reverse Lunges — 3 sets × 10 reps/leg",
          "Pike Push-Ups — 3 sets × 8–10 reps",
          "Single-Leg Glute Bridge — 3 sets × 10 reps/leg",
          "Band Pull Aparts / Towel Row — 3 sets × 15 reps",
          "Mountain Climbers — 3 sets × 30 sec",
        ],
        rest: "45–60 sec",
        progression: "Increase reps or tempo difficulty.",
        substitutions: [
          "Pike Push-Ups → Shoulder Press with bands",
          "Mountain Climbers → Step Jacks",
        ],
      },
      {
        day: "Friday",
        focus: "Home Conditioning",
        warmup: ["Walk in place", "Mobility flow 5 min"],
        exercises: [
          "Squat to Reach — 3 sets × 15 reps",
          "Push-Up Variation — 3 sets × 10 reps",
          "Split Squat — 3 sets × 10 reps/leg",
          "Band Row / Backpack Row — 3 sets × 12 reps",
          "Low-impact cardio circuit — 15–20 min",
        ],
        rest: "30–45 sec",
        progression: "Reduce rest or add reps over time.",
        substitutions: [
          "Split Squat → Step-Ups",
          "Cardio circuit → brisk walk",
        ],
      },
    ],
    muscle_gain: [
      {
        day: "Monday",
        focus: "Home Upper",
        warmup: ["Arm circles", "Band pull-aparts", "Push-up warm-up"],
        exercises: [
          "Push-Ups / Weighted Push-Ups — 4 sets × 8–12 reps",
          "Backpack Row — 4 sets × 10–12 reps",
          "Chair Dips — 3 sets × 10–12 reps",
          "Band Lateral Raise — 3 sets × 15 reps",
          "Backpack Curl — 3 sets × 12 reps",
        ],
        rest: "45–75 sec",
        progression: "Add backpack load or slow tempo.",
        substitutions: [
          "Chair Dips → Close-Grip Push-Ups",
          "Backpack Row → Band Row",
        ],
      },
      {
        day: "Wednesday",
        focus: "Home Lower",
        warmup: ["Leg swings", "Hip mobility", "2 light squat sets"],
        exercises: [
          "Bulgarian Split Squat — 4 sets × 8–10 reps/leg",
          "Backpack Romanian Deadlift — 4 sets × 10 reps",
          "Step-Ups — 3 sets × 10 reps/leg",
          "Glute Bridge — 3 sets × 15 reps",
          "Calf Raises — 4 sets × 15–20 reps",
        ],
        rest: "60–75 sec",
        progression: "Increase load with backpack or extra reps.",
        substitutions: [
          "Step-Ups → Reverse Lunges",
          "RDL → Single-Leg RDL",
        ],
      },
      {
        day: "Friday",
        focus: "Home Full Body Pump",
        warmup: ["Walk 3 min", "Shoulder + hip prep"],
        exercises: [
          "Incline or Decline Push-Ups — 3 sets × 10–15 reps",
          "Backpack Row — 3 sets × 12 reps",
          "Goblet Squat with Backpack — 3 sets × 12 reps",
          "Band Shoulder Press — 3 sets × 10 reps",
          "Arms Finisher — 2 rounds × 12–15 reps",
        ],
        rest: "45–60 sec",
        progression: "Add reps and density first.",
        substitutions: [
          "Band Shoulder Press → Pike Push-Ups",
          "Goblet Squat → Split Squat",
        ],
      },
    ],
    recomposition: [
      {
        day: "Monday",
        focus: "Home Strength Base",
        warmup: ["Walk 3 min", "Mobility 3–5 min"],
        exercises: [
          "Backpack Squat — 4 sets × 8–10 reps",
          "Push-Ups — 4 sets × 8–12 reps",
          "Backpack Row — 4 sets × 10 reps",
          "Romanian Deadlift with Backpack — 3 sets × 10 reps",
          "Plank — 3 sets × 40 sec",
        ],
        rest: "60 sec",
        progression: "Progress reps, then add backpack load.",
        substitutions: [
          "Backpack Squat → Split Squat",
          "Backpack Row → Band Row",
        ],
      },
      {
        day: "Wednesday",
        focus: "Home Hypertrophy + Cardio",
        warmup: ["Dynamic warm-up 5 min"],
        exercises: [
          "Reverse Lunges — 3 sets × 10 reps/leg",
          "Incline Push-Ups — 3 sets × 12 reps",
          "Band Row — 3 sets × 12 reps",
          "Band Lateral Raise — 3 sets × 15 reps",
          "Brisk walk / bike — 20 min",
        ],
        rest: "45–60 sec",
        progression: "Add reps and reduce rest gradually.",
        substitutions: [
          "Incline Push-Ups → Standard Push-Ups",
          "Brisk walk → step circuit",
        ],
      },
      {
        day: "Friday",
        focus: "Home Full Body",
        warmup: ["Walk 3 min", "Joint prep"],
        exercises: [
          "Goblet Squat with Backpack — 3 sets × 12 reps",
          "Push-Ups — 3 sets × 10–12 reps",
          "Backpack Row — 3 sets × 10–12 reps",
          "Split Squat — 3 sets × 10 reps/leg",
          "Leg Raise / Crunch — 3 sets × 15 reps",
        ],
        rest: "45–60 sec",
        progression: "Add one rep to each set before increasing load.",
        substitutions: [
          "Split Squat → Step-Ups",
          "Crunch → Dead Bug",
        ],
      },
    ],
    health: [
      {
        day: "Monday",
        focus: "Home Full Body",
        warmup: ["Walk 3 min", "Mobility 5 min"],
        exercises: [
          "Bodyweight Squat — 3 sets × 10 reps",
          "Incline Push-Ups — 3 sets × 8–10 reps",
          "Band Row / Towel Row — 3 sets × 10 reps",
          "Glute Bridge — 3 sets × 12 reps",
          "Plank — 3 sets × 20–30 sec",
        ],
        rest: "45 sec",
        progression: "Build consistency first, then increase reps.",
        substitutions: [
          "Incline Push-Ups → Wall Push-Ups",
          "Band Row → Backpack Row",
        ],
      },
      {
        day: "Wednesday",
        focus: "Mobility + Cardio",
        warmup: ["Easy walk 3 min"],
        exercises: [
          "Mobility flow — 10 min",
          "Brisk walk — 25–35 min",
          "Step-Ups — 3 sets × 10 reps/leg",
          "Band Pull Aparts — 3 sets × 15 reps",
        ],
        rest: "30–45 sec",
        progression: "Increase total movement time gradually.",
        substitutions: [
          "Brisk walk → stationary bike",
          "Step-Ups → split squat hold",
        ],
      },
      {
        day: "Friday",
        focus: "Strength + Conditioning",
        warmup: ["Walk 3 min", "Joint prep"],
        exercises: [
          "Backpack Squat — 3 sets × 10 reps",
          "Push-Ups — 3 sets × 8–10 reps",
          "Backpack Row — 3 sets × 10 reps",
          "Farmer Carry with bags — 3 rounds",
          "Walk — 15 min",
        ],
        rest: "45–60 sec",
        progression: "Keep training easy enough to repeat weekly.",
        substitutions: [
          "Farmer Carry → incline walk",
          "Push-Ups → incline push-ups",
        ],
      },
    ],
  };

  const outdoorBase: Record<Goal, WorkoutDay[]> = {
    fat_loss: [
      {
        day: "Monday",
        focus: "Outdoor Strength Circuit",
        warmup: ["Walk 5 min", "Mobility 5 min"],
        exercises: [
          "Bench Step-Ups — 3 sets × 12 reps/leg",
          "Incline Push-Ups on bench — 4 sets × 10–12 reps",
          "Walking Lunges — 3 sets × 12 reps/leg",
          "Pull-Up Bar Hangs / Assisted Pulls — 3 sets",
          "Brisk walk — 15 min",
        ],
        rest: "45–60 sec",
        progression: "Add reps or rounds before intensity.",
        substitutions: [
          "Incline Push-Ups → wall push-ups",
          "Lunges → bodyweight squats",
        ],
      },
      {
        day: "Wednesday",
        focus: "Outdoor Cardio + Core",
        warmup: ["Walk 5 min"],
        exercises: [
          "Fast walk / easy jog — 25–35 min",
          "Plank — 3 sets × 30–40 sec",
          "Bench knee raises — 3 sets × 15 reps",
          "Stair climb intervals — 6 rounds",
        ],
        rest: "As needed between intervals",
        progression: "Increase interval count or pace gradually.",
        substitutions: [
          "Jog → brisk walk",
          "Stairs → hill walk",
        ],
      },
      {
        day: "Friday",
        focus: "Outdoor Mixed Session",
        warmup: ["Walk 5 min", "Mobility"],
        exercises: [
          "Bodyweight Squat — 3 sets × 15 reps",
          "Push-Ups — 3 sets × 10 reps",
          "Walking Lunges — 3 sets × 10 reps/leg",
          "Hill walk — 15–20 min",
          "Carry backpack walk — 10 min",
        ],
        rest: "30–45 sec",
        progression: "Add time and reps gradually.",
        substitutions: [
          "Hill walk → flat brisk walk",
          "Push-Ups → incline push-ups",
        ],
      },
    ],
    muscle_gain: [
      {
        day: "Monday",
        focus: "Outdoor Upper Body",
        warmup: ["Arm circles", "Band warm-up if available"],
        exercises: [
          "Push-Ups — 4 sets × 10–15 reps",
          "Dips on bars / bench — 3 sets × 8–12 reps",
          "Pull-Ups / Assisted Pull-Ups — 4 sets",
          "Backpack Curl — 3 sets × 12 reps",
          "Band Lateral Raise — 3 sets × 15 reps",
        ],
        rest: "60–90 sec",
        progression: "Add reps and then backpack resistance.",
        substitutions: [
          "Pull-Ups → inverted rows",
          "Dips → close-grip push-ups",
        ],
      },
      {
        day: "Wednesday",
        focus: "Outdoor Lower Body",
        warmup: ["Walk 5 min", "Leg swings"],
        exercises: [
          "Bulgarian Split Squat on bench — 4 sets × 8–10 reps/leg",
          "Walking Lunges — 4 sets × 12 reps/leg",
          "Backpack Romanian Deadlift — 4 sets × 10 reps",
          "Calf Raises — 4 sets × 20 reps",
          "Hill walk — 10–15 min",
        ],
        rest: "60–75 sec",
        progression: "Increase backpack load or total reps.",
        substitutions: [
          "Bulgarian Split Squat → Step-Ups",
          "Hill walk → flat brisk walk",
        ],
      },
      {
        day: "Friday",
        focus: "Outdoor Full Body Pump",
        warmup: ["Walk 5 min", "Mobility"],
        exercises: [
          "Push-Ups — 3 sets × 12 reps",
          "Pull-Up variation — 3 sets",
          "Bodyweight Squat — 3 sets × 15 reps",
          "Bench Dips — 3 sets × 12 reps",
          "Carry backpack walk — 10 min",
        ],
        rest: "45–60 sec",
        progression: "Increase density and total work.",
        substitutions: [
          "Pull-Up variation → inverted row",
          "Bench dips → push-ups",
        ],
      },
    ],
    recomposition: [
      {
        day: "Monday",
        focus: "Outdoor Strength Base",
        warmup: ["Walk 5 min", "Mobility"],
        exercises: [
          "Bench Step-Ups — 4 sets × 10 reps/leg",
          "Push-Ups — 4 sets × 10 reps",
          "Pull-Ups / Assisted Rows — 4 sets",
          "Walking Lunges — 3 sets × 10 reps/leg",
          "Plank — 3 sets × 40 sec",
        ],
        rest: "60 sec",
        progression: "Add reps or harder variations gradually.",
        substitutions: [
          "Pull-Ups → inverted rows",
          "Step-Ups → bodyweight squats",
        ],
      },
      {
        day: "Wednesday",
        focus: "Outdoor Cardio + Hypertrophy",
        warmup: ["Walk 5 min"],
        exercises: [
          "Fast walk / jog — 20 min",
          "Push-Ups — 3 sets × 12 reps",
          "Bodyweight Squat — 3 sets × 15 reps",
          "Band Row / Inverted Row — 3 sets × 12 reps",
          "Core work — 3 sets",
        ],
        rest: "45–60 sec",
        progression: "Increase pace or total reps week to week.",
        substitutions: [
          "Jog → brisk walk",
          "Band Row → backpack row",
        ],
      },
      {
        day: "Friday",
        focus: "Outdoor Full Body",
        warmup: ["Walk 5 min", "Mobility"],
        exercises: [
          "Split Squat — 3 sets × 10 reps/leg",
          "Push-Ups — 3 sets × 10–12 reps",
          "Pull-Up / Row variation — 3 sets",
          "Hill walk — 15 min",
          "Leg Raises — 3 sets × 15 reps",
        ],
        rest: "45–60 sec",
        progression: "Add quality before intensity.",
        substitutions: [
          "Pull-Up variation → inverted row",
          "Hill walk → flat walk",
        ],
      },
    ],
    health: [
      {
        day: "Monday",
        focus: "Outdoor Full Body",
        warmup: ["Walk 5 min", "Mobility"],
        exercises: [
          "Bodyweight Squat — 3 sets × 10 reps",
          "Incline Push-Ups — 3 sets × 8–10 reps",
          "Step-Ups — 3 sets × 10 reps/leg",
          "Band Row / Towel Row — 3 sets × 10 reps",
          "Walk — 15 min",
        ],
        rest: "45 sec",
        progression: "Build consistency and easy recovery.",
        substitutions: [
          "Incline Push-Ups → wall push-ups",
          "Band Row → backpack row",
        ],
      },
      {
        day: "Wednesday",
        focus: "Walk + Mobility",
        warmup: ["Easy walk 3 min"],
        exercises: [
          "Brisk walk — 30–40 min",
          "Mobility flow — 10 min",
          "Breathing / relaxation — 5 min",
        ],
        rest: "As needed",
        progression: "Increase distance or frequency.",
        substitutions: [
          "Brisk walk → bike ride",
        ],
      },
      {
        day: "Friday",
        focus: "Outdoor Strength + Conditioning",
        warmup: ["Walk 5 min", "Mobility"],
        exercises: [
          "Walking Lunges — 3 sets × 10 reps/leg",
          "Push-Ups — 3 sets × 8–10 reps",
          "Bodyweight Squat — 3 sets × 12 reps",
          "Bench step-ups — 3 sets × 10 reps/leg",
          "Walk — 15 min",
        ],
        rest: "45 sec",
        progression: "Add reps and total time gradually.",
        substitutions: [
          "Walking Lunges → split squats",
          "Push-Ups → incline push-ups",
        ],
      },
    ],
  };

  let plan = gymFatLoss;
  if (trainingMode === "gym") {
    if (goal === "fat_loss") plan = gymFatLoss;
    if (goal === "muscle_gain") plan = gymMuscle;
    if (goal === "recomposition") plan = gymRecomp;
    if (goal === "health") plan = gymHealth;
  } else if (trainingMode === "home") {
    plan = homeBase[goal];
  } else {
    plan = outdoorBase[goal];
  }

  if (workoutsPerWeek <= 2) return plan.slice(0, 2);
  if (workoutsPerWeek === 3) return plan;
  if (workoutsPerWeek >= 4) {
    return [
      ...plan,
      {
        day: "Saturday",
        focus: "Bonus Session / Optional Conditioning",
        warmup: ["5 min light movement", "Quick mobility"],
        exercises: [
          "Zone 2 cardio — 25–35 min",
          "Mobility — 10 min",
          "Core work — 3 sets",
          "Optional weak-point work",
        ],
        rest: "Easy pace",
        progression: "Add time gradually without hurting recovery.",
        substitutions: [
          "Zone 2 cardio → brisk walk / bike / easy jog",
        ],
      },
    ];
  }

  return plan;
}

function buildMealStructure(goal: Goal): string[] {
  if (goal === "fat_loss") {
    return [
      "Breakfast: eggs or Greek yogurt + berries + oats",
      "Lunch: chicken / fish / lean meat + potatoes or rice + large salad",
      "Dinner: protein source + vegetables + moderate carbs",
      "Snack ideas: cottage cheese, protein shake, fruit, carrots, boiled eggs",
      "Rule: keep meals high in protein and high in volume",
    ];
  }
  if (goal === "muscle_gain") {
    return [
      "Breakfast: eggs + oats + fruit + yogurt",
      "Lunch: rice / pasta + chicken / beef / salmon + vegetables",
      "Dinner: potatoes / rice + protein source + olive oil / avocado",
      "Snack ideas: protein shake, nuts, Greek yogurt, sandwiches, fruit",
      "Rule: eat 3–5 meals/day and include protein every time",
    ];
  }
  if (goal === "recomposition") {
    return [
      "Breakfast: high-protein meal with moderate carbs",
      "Lunch: protein + rice/potatoes + vegetables",
      "Dinner: lean protein + vegetables + moderate carbs",
      "Snack ideas: yogurt, protein shake, fruit, cottage cheese",
      "Rule: stay close to maintenance calories and keep protein high",
    ];
  }
  return [
    "Breakfast: protein + fruit + simple carbs",
    "Lunch: balanced plate with protein, vegetables and quality carbs",
    "Dinner: lighter balanced meal with protein and vegetables",
    "Snack ideas: yogurt, fruit, nuts, boiled eggs",
    "Rule: optimize consistency, energy and digestion",
  ];
}

function buildAnalysis(form: FormState, hasPhoto: boolean): AnalysisResult {
  const bmr = calcBmr(form);
  const tdee = Math.round(bmr * activityMultiplier(form.activity));

  let calorieTarget = tdee;
  if (form.goal === "fat_loss") calorieTarget = tdee - 350;
  if (form.goal === "muscle_gain") calorieTarget = tdee + 250;
  if (form.goal === "recomposition") calorieTarget = tdee - 100;
  if (form.goal === "health") calorieTarget = tdee;

  let proteinPerKg = 1.8;
  if (form.goal === "muscle_gain") proteinPerKg = 2.0;
  if (form.goal === "fat_loss") proteinPerKg = 2.1;
  if (form.goal === "health") proteinPerKg = 1.6;

  const protein = Math.round(form.weight * proteinPerKg);
  const waterLiters = Math.max(2.2, Math.round(form.weight * 0.035 * 10) / 10);

  const bmi = form.weight / Math.pow(form.height / 100, 2);

  let compositionBase = 72;
  if (bmi > 27) compositionBase -= 12;
  else if (bmi > 24) compositionBase -= 6;
  else if (bmi < 20) compositionBase -= 4;

  let strengthBase = 68 + form.workoutsPerWeek * 3;
  if (form.goal === "muscle_gain") strengthBase += 4;

  let postureBase = 64;
  if (form.activity === "low") postureBase -= 4;
  if (form.workoutsPerWeek >= 3) postureBase += 3;

  let recoveryBase = 66;
  if (form.activity === "high") recoveryBase -= 2;
  if (form.goal === "health") recoveryBase += 3;

  const scores = {
    composition: clamp(Math.round(compositionBase), 45, 92),
    strength: clamp(Math.round(strengthBase), 50, 95),
    posture: clamp(Math.round(postureBase), 48, 90),
    recovery: clamp(Math.round(recoveryBase), 50, 92),
  };

  const photoInsights: string[] = [];
  if (hasPhoto) {
    if (form.goal === "fat_loss") {
      photoInsights.push("Photo-based impression: moderate fat storage likely concentrated around waist and lower torso.");
      photoInsights.push("Upper body muscle baseline appears sufficient to preserve during a controlled fat-loss phase.");
      photoInsights.push("Best visual payoff will likely come from fat loss + posture improvement, not random bulking.");
    } else if (form.goal === "muscle_gain") {
      photoInsights.push("Photo-based impression: solid baseline for adding visible muscle, especially chest, shoulders and upper back.");
      photoInsights.push("Main opportunity appears to be improved upper-body density and fuller frame through progressive overload.");
      photoInsights.push("A controlled surplus with structured strength work is likely more productive than aggressive mass gain.");
    } else if (form.goal === "recomposition") {
      photoInsights.push("Photo-based impression: body composition can likely improve well through simultaneous fat reduction and muscle retention.");
      photoInsights.push("There appears to be enough baseline muscle to respond well to recomposition-focused training.");
      photoInsights.push("Consistency in protein intake and weekly training volume will matter more than extreme calorie changes.");
    } else {
      photoInsights.push("Photo-based impression: overall wellness improvement would likely come most from posture, mobility, strength and recovery habits.");
      photoInsights.push("A balanced plan is likely the highest-return strategy for energy, movement quality and long-term adherence.");
    }
  } else {
    photoInsights.push("No photo uploaded yet. Current insights are based on body data, goal and activity only.");
  }

  const bodySummary: string[] = [
    `Profile: ${form.age} y/o, ${form.height} cm, ${form.weight} kg, goal: ${labelGoal(form.goal)}.`,
    `Training mode selected: ${labelTrainingMode(form.trainingMode)}.`,
  ];

  if (form.goal === "fat_loss") {
    bodySummary.push("Primary objective: lower body fat while preserving lean mass and performance.");
  } else if (form.goal === "muscle_gain") {
    bodySummary.push("Primary objective: build muscle with a controlled calorie surplus and strong recovery.");
  } else if (form.goal === "recomposition") {
    bodySummary.push("Primary objective: improve muscle-to-fat ratio without extreme bulking or cutting.");
  } else {
    bodySummary.push("Primary objective: improve health, energy, movement quality and sustainable fitness.");
  }

  const training: string[] = [];
  training.push(`Current training environment: ${labelTrainingMode(form.trainingMode)}.`);
  if (form.workoutsPerWeek <= 2) {
    training.push("Use 2 structured training sessions per week plus regular walking.");
  } else if (form.workoutsPerWeek <= 4) {
    training.push(`Train ${form.workoutsPerWeek} times per week using a realistic, repeatable schedule.`);
  } else {
    training.push(`Train ${form.workoutsPerWeek} times per week with deliberate fatigue management and recovery.`);
  }

  if (form.goal === "fat_loss") {
    training.push("Strength work stays the base; cardio supports fat loss but should not replace resistance work.");
    training.push("Target 8k–10k daily steps and short post-workout cardio.");
  }
  if (form.goal === "muscle_gain") {
    training.push("Use progressive overload and prioritize upper body, legs and recovery quality.");
  }
  if (form.goal === "recomposition") {
    training.push("Use strength-focused sessions with moderate cardio and high weekly consistency.");
  }
  if (form.goal === "health") {
    training.push("Keep training sustainable, joint-friendly and easy to repeat for months.");
  }

  const nutrition: string[] = [
    `Estimated calorie target: ${calorieTarget} kcal/day.`,
    `Protein target: ${protein} g/day.`,
    `Water target: ${waterLiters} L/day.`,
    "Base meals around protein first, then vegetables, fruit, quality carbs and healthy fats.",
    "Keep 80–90% of intake from minimally processed foods.",
  ];

  if (form.goal === "fat_loss") {
    nutrition.push("Use a moderate calorie deficit and avoid crash dieting.");
    nutrition.push("Choose high-volume foods: vegetables, berries, potatoes, lean protein and soups.");
    nutrition.push("Limit liquid calories and random snacking.");
  }
  if (form.goal === "muscle_gain") {
    nutrition.push("Use a controlled surplus from carbs + protein, not uncontrolled junk calories.");
    nutrition.push("Aim for 3–5 meals/day with protein in each meal.");
  }
  if (form.goal === "recomposition") {
    nutrition.push("Stay near maintenance calories, keep protein high and monitor progress over time.");
  }
  if (form.goal === "health") {
    nutrition.push("Prioritize stable energy, simple meal structure and long-term consistency.");
  }
  if (form.bloodType.trim()) {
    nutrition.push(
      `Blood type entered: ${form.bloodType}. Currently treated as optional profile data only, not as the main engine for recommendations.`
    );
  }

  const lifestyle: string[] = [
    "Sleep target: 7.5–8.5 hours/night.",
    "Do 5–10 minutes of mobility or stretching daily.",
    "Review weight, photos, energy and training performance weekly.",
    "Adjust calories or training only after 2–3 weeks of consistent real data.",
    "Recovery quality improves body composition more than perfectionism.",
  ];

  return {
    photoInsights,
    bodySummary,
    training,
    workoutPlan: buildWorkoutPlan(form.goal, form.workoutsPerWeek, form.trainingMode),
    nutrition,
    mealStructure: buildMealStructure(form.goal),
    lifestyle,
    calories: `~${calorieTarget} kcal/day`,
    protein: `~${protein} g/day`,
    water: `~${waterLiters} L/day`,
    scores,
  };
}

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const fileLabel = useMemo(() => {
    if (!file) return "No photo selected";
    return `${file.name} (${Math.round(file.size / 1024)} KB)`;
  }, [file]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setAnalysis(null);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (f) setPreviewUrl(URL.createObjectURL(f));
    else setPreviewUrl(null);
  }

  async function runAnalysis() {
    setIsRunning(true);
    setAnalysis(null);
    await new Promise((r) => setTimeout(r, 900));
    setAnalysis(buildAnalysis(form, !!file));
    setIsRunning(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 28,
        background:
          "radial-gradient(1000px 500px at 10% 10%, rgba(79,70,229,0.25), transparent 60%), #0b0b10",
        color: "white",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 1220, margin: "0 auto", display: "grid", gap: 18 }}>
        <section
          style={{
            borderRadius: 24,
            padding: 24,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.68, letterSpacing: 0.4 }}>
                HealthVision AI · Premium Fitness MVP
              </div>
              <h1 style={{ margin: "10px 0 8px", fontSize: 44, lineHeight: 1.05 }}>
                Photo + Profile → Training + Nutrition Plan
              </h1>
              <p style={{ margin: 0, opacity: 0.76, maxWidth: 760, fontSize: 17 }}>
                Upload a photo, add your profile, and generate a structured AI wellness report
                with body insights, training recommendations, actual workout structure, nutrition guidance,
                meal structure, and recovery strategy.
              </p>
            </div>

            <div
              style={{
                padding: "10px 12px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.05)",
                fontSize: 12,
                alignSelf: "flex-start",
              }}
            >
              Status: MVP active ✅
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "0.92fr 1.08fr",
            gap: 18,
          }}
        >
          <div
            style={{
              borderRadius: 24,
              padding: 20,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>User Input</h2>

            <div
              style={{
                borderRadius: 16,
                border: "1px dashed rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.03)",
                minHeight: 280,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                marginBottom: 14,
              }}
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: 360,
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div style={{ textAlign: "center", opacity: 0.72 }}>
                  <div style={{ fontSize: 18, marginBottom: 6 }}>No body photo yet</div>
                  <div style={{ fontSize: 13 }}>Upload a photo to complete the profile.</div>
                </div>
              )}
            </div>

            <label
              style={{
                display: "block",
                padding: 14,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.20)",
                cursor: "pointer",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 13, opacity: 0.82, marginBottom: 8 }}>Body photo</div>
              <div style={{ fontSize: 12, opacity: 0.72, marginBottom: 8 }}>{fileLabel}</div>
              <div
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "rgba(79,70,229,0.70)",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Choose file
              </div>
              <input type="file" accept="image/*" onChange={onPickFile} style={{ display: "none" }} />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Sex">
                <select
                  value={form.sex}
                  onChange={(e) => updateField("sex", e.target.value as Sex)}
                  style={inputStyle}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </Field>

              <Field label="Age">
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => updateField("age", Number(e.target.value))}
                  style={inputStyle}
                />
              </Field>

              <Field label="Height (cm)">
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => updateField("height", Number(e.target.value))}
                  style={inputStyle}
                />
              </Field>

              <Field label="Weight (kg)">
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => updateField("weight", Number(e.target.value))}
                  style={inputStyle}
                />
              </Field>

              <Field label="Goal">
                <select
                  value={form.goal}
                  onChange={(e) => updateField("goal", e.target.value as Goal)}
                  style={inputStyle}
                >
                  <option value="fat_loss">Fat Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="recomposition">Recomposition</option>
                  <option value="health">General Health</option>
                </select>
              </Field>

              <Field label="Activity">
                <select
                  value={form.activity}
                  onChange={(e) => updateField("activity", e.target.value as Activity)}
                  style={inputStyle}
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </Field>

              <Field label="Workouts / week">
                <input
                  type="number"
                  min={0}
                  max={7}
                  value={form.workoutsPerWeek}
                  onChange={(e) => updateField("workoutsPerWeek", Number(e.target.value))}
                  style={inputStyle}
                />
              </Field>

              <Field label="Blood type (optional)">
                <input
                  type="text"
                  placeholder="e.g. O+, A-, AB+"
                  value={form.bloodType}
                  onChange={(e) => updateField("bloodType", e.target.value)}
                  style={inputStyle}
                />
              </Field>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>Training Mode</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {(["gym", "home", "outdoor"] as TrainingMode[]).map((mode) => {
                  const active = form.trainingMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => updateField("trainingMode", mode)}
                      style={{
                        padding: "11px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: active ? "rgba(79,70,229,0.65)" : "rgba(0,0,0,0.22)",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      {labelTrainingMode(mode)}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={runAnalysis}
              disabled={isRunning}
              style={{
                width: "100%",
                marginTop: 18,
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(79,70,229,0.75)",
                color: "white",
                fontWeight: 800,
                fontSize: 15,
                cursor: isRunning ? "not-allowed" : "pointer",
                opacity: isRunning ? 0.7 : 1,
              }}
            >
              {isRunning ? "Generating report…" : "Generate Health Plan →"}
            </button>

            <p style={{ marginTop: 12, fontSize: 12, opacity: 0.55 }}>
              Wellness guidance only. Not medical advice.
            </p>
          </div>

          <div
            style={{
              borderRadius: 24,
              padding: 20,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: 0 }}>AI Wellness Report</h2>
              <div
                style={{
                  padding: "8px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  fontSize: 12,
                  opacity: 0.8,
                }}
              >
                Fitness startup mode ⚡
              </div>
            </div>

            {!analysis ? (
              <div
                style={{
                  marginTop: 14,
                  borderRadius: 16,
                  border: "1px dashed rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.03)",
                  minHeight: 540,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 24,
                  opacity: 0.75,
                }}
              >
                Fill in the profile and generate your first training and nutrition plan.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
                <MetricRow calories={analysis.calories} protein={analysis.protein} water={analysis.water} />
                <ScoreRow scores={analysis.scores} />
                <ReportCard title="Photo Insights" items={analysis.photoInsights} />
                <ReportCard title="Body Summary" items={analysis.bodySummary} />
                <ReportCard title="Training Recommendations" items={analysis.training} />
                <WorkoutPlanCard plan={analysis.workoutPlan} />
                <ReportCard title="Nutrition Guidance" items={analysis.nutrition} />
                <ReportCard title="Meal Structure" items={analysis.mealStructure} />
                <ReportCard title="Lifestyle & Recovery" items={analysis.lifestyle} />

                <div
                  style={{
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "linear-gradient(135deg, rgba(79,70,229,0.16), rgba(255,255,255,0.04))",
                    padding: 16,
                  }}
                >
                  <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 18 }}>DNA Personalization</h3>
                  <p style={{ margin: 0, opacity: 0.82, lineHeight: 1.5 }}>
                    Unlock deeper personalization later by connecting DNA profile data.
                    This layer can refine nutrient tolerance, recovery emphasis, and training response assumptions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, opacity: 0.8 }}>{label}</span>
      {children}
    </label>
  );
}

function ReportCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(0,0,0,0.20)",
        padding: 16,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 18 }}>{title}</h3>
      <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
        {items.map((item, idx) => (
          <li key={idx} style={{ opacity: 0.88, lineHeight: 1.45 }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function WorkoutPlanCard({ plan }: { plan: WorkoutDay[] }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(0,0,0,0.20)",
        padding: 16,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 18 }}>Workout Plan</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {plan.map((day, idx) => (
          <div
            key={idx}
            style={{
              borderRadius: 14,
              padding: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.7 }}>{day.day}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{day.focus}</div>

            <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>Warm-up</div>
            <ul style={{ marginTop: 6, paddingLeft: 18, display: "grid", gap: 4 }}>
              {day.warmup.map((item, i) => (
                <li key={i} style={{ opacity: 0.9, lineHeight: 1.4 }}>
                  {item}
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>Exercises</div>
            <ul style={{ marginTop: 6, paddingLeft: 18, display: "grid", gap: 6 }}>
              {day.exercises.map((exercise, i) => (
                <li key={i} style={{ opacity: 0.9, lineHeight: 1.4 }}>
                  {exercise}
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>Rest Time</div>
            <div style={{ marginTop: 4, opacity: 0.9 }}>{day.rest}</div>

            <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>Progression</div>
            <div style={{ marginTop: 4, opacity: 0.9 }}>{day.progression}</div>

            <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>Alternatives</div>
            <ul style={{ marginTop: 6, paddingLeft: 18, display: "grid", gap: 4 }}>
              {day.substitutions.map((sub, i) => (
                <li key={i} style={{ opacity: 0.9, lineHeight: 1.4 }}>
                  {sub}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricRow({
  calories,
  protein,
  water,
}: {
  calories: string;
  protein: string;
  water: string;
}) {
  const cardStyle: React.CSSProperties = {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.20)",
    padding: 14,
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
      <div style={cardStyle}>
        <div style={{ fontSize: 12, opacity: 0.68 }}>Calories</div>
        <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800 }}>{calories}</div>
      </div>
      <div style={cardStyle}>
        <div style={{ fontSize: 12, opacity: 0.68 }}>Protein</div>
        <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800 }}>{protein}</div>
      </div>
      <div style={cardStyle}>
        <div style={{ fontSize: 12, opacity: 0.68 }}>Water</div>
        <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800 }}>{water}</div>
      </div>
    </div>
  );
}

function ScoreRow({
  scores,
}: {
  scores: {
    composition: number;
    strength: number;
    posture: number;
    recovery: number;
  };
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
      <ScoreCard label="Composition" value={scores.composition} />
      <ScoreCard label="Strength" value={scores.strength} />
      <ScoreCard label="Posture" value={scores.posture} />
      <ScoreCard label="Recovery" value={scores.recovery} />
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const cardStyle: React.CSSProperties = {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.20)",
    padding: 14,
  };

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 12, opacity: 0.68 }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800 }}>{value}/100</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.22)",
  color: "white",
  outline: "none",
};