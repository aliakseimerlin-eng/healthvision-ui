"use client";

import React, { useMemo, useState } from "react";
import heic2any from "heic2any";

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

const MAX_FILE_SIZE_MB = 8;
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

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
  const gymPlans: Record<Goal, WorkoutDay[]> = {
    fat_loss: [
      {
        day: "Monday",
        focus: "Full Body Strength A",
        warmup: ["5 min treadmill / bike", "Hip mobility", "2 warm-up sets"],
        exercises: [
          "Squat or Leg Press — 4 × 8–10",
          "Bench Press or Push-Ups — 4 × 8–12",
          "Seated Row — 4 × 10–12",
          "Romanian Deadlift — 3 × 8–10",
          "Plank — 3 × 30–45 sec",
        ],
        rest: "60–90 sec",
        progression: "Complete all reps with good form → add 2.5–5 kg next session.",
        substitutions: ["Bench Press → Machine Press", "Squat → Goblet Squat"],
      },
      {
        day: "Wednesday",
        focus: "Full Body Strength B",
        warmup: ["5 min incline walk", "Shoulder mobility", "1–2 ramp-up sets"],
        exercises: [
          "Deadlift or Trap Bar Deadlift — 3 × 5–6",
          "Shoulder Press — 3 × 8–10",
          "Lat Pulldown — 4 × 10–12",
          "Walking Lunges — 3 × 10 / leg",
          "Cable Crunch — 3 × 12–15",
          "20 min incline walk or bike",
        ],
        rest: "75–120 sec",
        progression: "Add reps first, then weight.",
        substitutions: ["Deadlift → Romanian Deadlift", "Lat Pulldown → Seated Row"],
      },
      {
        day: "Friday",
        focus: "Full Body + Conditioning",
        warmup: ["5 min bike", "Dynamic squat + hinge prep"],
        exercises: [
          "Goblet Squat — 3 × 12",
          "Incline Dumbbell Press — 3 × 10–12",
          "Chest-Supported Row — 3 × 10–12",
          "Kettlebell Swing — 3 × 12–15",
          "Farmer Carry — 3 rounds",
          "Conditioning — 15–20 min",
        ],
        rest: "45–75 sec",
        progression: "Increase reps first, then load.",
        substitutions: ["Farmer Carry → incline walk", "Swing → light RDL"],
      },
    ],
    muscle_gain: [
      {
        day: "Monday",
        focus: "Upper Body",
        warmup: ["5 min cardio", "Band warm-up", "2 warm-up sets"],
        exercises: [
          "Bench Press — 4 × 6–8",
          "Incline Dumbbell Press — 3 × 8–10",
          "Seated Row — 4 × 8–10",
          "Lat Pulldown — 3 × 10–12",
          "Lateral Raises — 3 × 12–15",
          "Biceps + Triceps — 3 × 12",
        ],
        rest: "60–90 sec",
        progression: "Hit top reps → add load.",
        substitutions: ["Bench Press → Machine Chest Press", "Lat Pulldown → Assisted Pull-Up"],
      },
      {
        day: "Wednesday",
        focus: "Lower Body",
        warmup: ["5 min bike", "Hip + ankle mobility"],
        exercises: [
          "Squat or Hack Squat — 4 × 6–8",
          "Romanian Deadlift — 4 × 8–10",
          "Leg Press — 3 × 10–12",
          "Hamstring Curl — 3 × 12",
          "Calf Raises — 4 × 12–15",
          "Hanging Knee Raises — 3 × 12",
        ],
        rest: "75–120 sec",
        progression: "Add weight only when reps stay clean.",
        substitutions: ["Hack Squat → Leg Press", "RDL → Dumbbell RDL"],
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
          "Rear Delt Fly — 3 × 12–15",
          "Arms Finisher — 2–3 rounds",
        ],
        rest: "60–90 sec",
        progression: "Add reps before load.",
        substitutions: ["Cable Fly → Dumbbell Fly", "Machine Row → Chest-Supported Row"],
      },
    ],
    recomposition: [
      {
        day: "Monday",
        focus: "Strength Base",
        warmup: ["5 min cardio", "Hip mobility"],
        exercises: [
          "Squat — 4 × 6–8",
          "Bench Press — 4 × 6–8",
          "Row — 4 × 8–10",
          "Romanian Deadlift — 3 × 8",
          "Plank — 3 × 40 sec",
        ],
        rest: "75–120 sec",
        progression: "Slow steady progression, 1–2 reps in reserve.",
        substitutions: ["Bench Press → Machine Press", "Row → Cable Row"],
      },
      {
        day: "Wednesday",
        focus: "Hypertrophy + Cardio",
        warmup: ["5 min bike", "Shoulder + hip prep"],
        exercises: [
          "Leg Press — 3 × 10–12",
          "Incline Dumbbell Press — 3 × 10–12",
          "Lat Pulldown — 3 × 10–12",
          "Lateral Raises — 3 × 15",
          "Bike / treadmill — 20 min",
        ],
        rest: "45–75 sec",
        progression: "Improve reps and control first.",
        substitutions: ["Leg Press → Goblet Squat", "Lat Pulldown → Seated Row"],
      },
      {
        day: "Friday",
        focus: "Full Body",
        warmup: ["5 min incline walk", "Dynamic prep"],
        exercises: [
          "Deadlift — 3 × 5",
          "Push-Ups / Assisted Dips — 3 × 10–12",
          "Chest Supported Row — 3 × 10",
          "Walking Lunges — 3 × 10 / leg",
          "Cable Crunch — 3 × 15",
        ],
        rest: "60–90 sec",
        progression: "Add load gradually without breaking form.",
        substitutions: ["Deadlift → Romanian Deadlift", "Dips → Push-Ups"],
      },
    ],
    health: [
      {
        day: "Monday",
        focus: "Full Body Strength",
        warmup: ["5 min treadmill", "Joint mobility"],
        exercises: [
          "Goblet Squat — 3 × 10",
          "Push-Ups — 3 × 8–12",
          "Cable Row — 3 × 10",
          "Romanian Deadlift — 3 × 10",
          "Plank — 3 × 30 sec",
        ],
        rest: "45–75 sec",
        progression: "Increase reps before weight.",
        substitutions: ["Push-Ups → Machine Chest Press", "Goblet Squat → Leg Press"],
      },
      {
        day: "Wednesday",
        focus: "Mobility + Cardio",
        warmup: ["Easy walk 5 min"],
        exercises: [
          "Mobility flow — 10–15 min",
          "Walking / bike — 25–35 min",
          "Split Squat — 3 × 10 / leg",
          "Band Pull Aparts — 3 × 15",
          "Breathing — 5 min",
        ],
        rest: "30–45 sec",
        progression: "Increase total movement time.",
        substitutions: ["Bike → incline walk", "Split Squat → Step-Ups"],
      },
      {
        day: "Friday",
        focus: "Strength + Conditioning",
        warmup: ["5 min bike", "Basic mobility"],
        exercises: [
          "Leg Press or Squat — 3 × 8–10",
          "Shoulder Press — 3 × 8–10",
          "Lat Pulldown — 3 × 10–12",
          "Farmer Carry — 3 rounds",
          "Incline walk — 15–20 min",
        ],
        rest: "60–75 sec",
        progression: "Keep recovery easy and consistent.",
        substitutions: ["Farmer Carry → incline walk", "Lat Pulldown → Seated Row"],
      },
    ],
  };

  const homePlans: Record<Goal, WorkoutDay[]> = {
    fat_loss: [
      {
        day: "Monday",
        focus: "Home Full Body A",
        warmup: ["March in place", "Hip circles", "Arm swings"],
        exercises: [
          "Bodyweight Squat — 4 × 12–15",
          "Push-Ups — 4 × 8–12",
          "Glute Bridge — 4 × 12–15",
          "Backpack Row — 3 × 10–12",
          "Plank — 3 × 30–45 sec",
        ],
        rest: "45–60 sec",
        progression: "Add reps first, then backpack load.",
        substitutions: ["Push-Ups → Incline Push-Ups", "Backpack Row → Band Row"],
      },
      {
        day: "Wednesday",
        focus: "Home Full Body B",
        warmup: ["Walk 3 min", "Dynamic lunges", "Shoulder rolls"],
        exercises: [
          "Reverse Lunges — 3 × 10 / leg",
          "Pike Push-Ups — 3 × 8–10",
          "Single-Leg Glute Bridge — 3 × 10 / leg",
          "Band Pull Aparts — 3 × 15",
          "Mountain Climbers — 3 × 30 sec",
        ],
        rest: "45–60 sec",
        progression: "Increase reps or harder tempo.",
        substitutions: ["Pike Push-Ups → Band Shoulder Press", "Mountain Climbers → Step Jacks"],
      },
      {
        day: "Friday",
        focus: "Home Conditioning",
        warmup: ["Walk in place", "Mobility flow"],
        exercises: [
          "Squat to Reach — 3 × 15",
          "Push-Up Variation — 3 × 10",
          "Split Squat — 3 × 10 / leg",
          "Band Row / Backpack Row — 3 × 12",
          "Low-impact cardio — 15–20 min",
        ],
        rest: "30–45 sec",
        progression: "Reduce rest or add reps.",
        substitutions: ["Split Squat → Step-Ups", "Cardio circuit → brisk walk"],
      },
    ],
    muscle_gain: [
      {
        day: "Monday",
        focus: "Home Upper",
        warmup: ["Arm circles", "Band pull-aparts", "Push-up warm-up"],
        exercises: [
          "Push-Ups / Weighted Push-Ups — 4 × 8–12",
          "Backpack Row — 4 × 10–12",
          "Chair Dips — 3 × 10–12",
          "Band Lateral Raise — 3 × 15",
          "Backpack Curl — 3 × 12",
        ],
        rest: "45–75 sec",
        progression: "Add backpack load or slower tempo.",
        substitutions: ["Chair Dips → Close-Grip Push-Ups", "Backpack Row → Band Row"],
      },
      {
        day: "Wednesday",
        focus: "Home Lower",
        warmup: ["Leg swings", "Hip mobility"],
        exercises: [
          "Bulgarian Split Squat — 4 × 8–10 / leg",
          "Backpack Romanian Deadlift — 4 × 10",
          "Step-Ups — 3 × 10 / leg",
          "Glute Bridge — 3 × 15",
          "Calf Raises — 4 × 15–20",
        ],
        rest: "60–75 sec",
        progression: "Increase load or reps.",
        substitutions: ["Step-Ups → Reverse Lunges", "RDL → Single-Leg RDL"],
      },
      {
        day: "Friday",
        focus: "Home Full Body Pump",
        warmup: ["Walk 3 min", "Shoulder + hip prep"],
        exercises: [
          "Incline / Decline Push-Ups — 3 × 10–15",
          "Backpack Row — 3 × 12",
          "Goblet Squat with Backpack — 3 × 12",
          "Band Shoulder Press — 3 × 10",
          "Arms Finisher — 2 rounds",
        ],
        rest: "45–60 sec",
        progression: "Add reps and density.",
        substitutions: ["Band Shoulder Press → Pike Push-Ups", "Goblet Squat → Split Squat"],
      },
    ],
    recomposition: [
      {
        day: "Monday",
        focus: "Home Strength Base",
        warmup: ["Walk 3 min", "Mobility 3–5 min"],
        exercises: [
          "Backpack Squat — 4 × 8–10",
          "Push-Ups — 4 × 8–12",
          "Backpack Row — 4 × 10",
          "Backpack RDL — 3 × 10",
          "Plank — 3 × 40 sec",
        ],
        rest: "60 sec",
        progression: "Progress reps, then load.",
        substitutions: ["Backpack Squat → Split Squat", "Backpack Row → Band Row"],
      },
      {
        day: "Wednesday",
        focus: "Home Hypertrophy + Cardio",
        warmup: ["Dynamic warm-up 5 min"],
        exercises: [
          "Reverse Lunges — 3 × 10 / leg",
          "Incline Push-Ups — 3 × 12",
          "Band Row — 3 × 12",
          "Band Lateral Raise — 3 × 15",
          "Brisk walk / bike — 20 min",
        ],
        rest: "45–60 sec",
        progression: "Add reps and reduce rest.",
        substitutions: ["Incline Push-Ups → Standard Push-Ups", "Walk → step circuit"],
      },
      {
        day: "Friday",
        focus: "Home Full Body",
        warmup: ["Walk 3 min", "Joint prep"],
        exercises: [
          "Goblet Squat with Backpack — 3 × 12",
          "Push-Ups — 3 × 10–12",
          "Backpack Row — 3 × 10–12",
          "Split Squat — 3 × 10 / leg",
          "Leg Raise / Crunch — 3 × 15",
        ],
        rest: "45–60 sec",
        progression: "Add one rep to each set before more load.",
        substitutions: ["Split Squat → Step-Ups", "Crunch → Dead Bug"],
      },
    ],
    health: [
      {
        day: "Monday",
        focus: "Home Full Body",
        warmup: ["Walk 3 min", "Mobility 5 min"],
        exercises: [
          "Bodyweight Squat — 3 × 10",
          "Incline Push-Ups — 3 × 8–10",
          "Band Row / Towel Row — 3 × 10",
          "Glute Bridge — 3 × 12",
          "Plank — 3 × 20–30 sec",
        ],
        rest: "45 sec",
        progression: "Build consistency first.",
        substitutions: ["Incline Push-Ups → Wall Push-Ups", "Band Row → Backpack Row"],
      },
      {
        day: "Wednesday",
        focus: "Mobility + Cardio",
        warmup: ["Easy walk 3 min"],
        exercises: [
          "Mobility flow — 10 min",
          "Brisk walk — 25–35 min",
          "Step-Ups — 3 × 10 / leg",
          "Band Pull Aparts — 3 × 15",
        ],
        rest: "30–45 sec",
        progression: "Increase total movement time.",
        substitutions: ["Walk → stationary bike", "Step-Ups → split squat hold"],
      },
      {
        day: "Friday",
        focus: "Strength + Conditioning",
        warmup: ["Walk 3 min", "Joint prep"],
        exercises: [
          "Backpack Squat — 3 × 10",
          "Push-Ups — 3 × 8–10",
          "Backpack Row — 3 × 10",
          "Farmer Carry with bags — 3 rounds",
          "Walk — 15 min",
        ],
        rest: "45–60 sec",
        progression: "Keep it easy enough to repeat weekly.",
        substitutions: ["Farmer Carry → incline walk", "Push-Ups → incline push-ups"],
      },
    ],
  };

  const outdoorPlans: Record<Goal, WorkoutDay[]> = {
    fat_loss: [
      {
        day: "Monday",
        focus: "Outdoor Strength Circuit",
        warmup: ["Walk 5 min", "Mobility 5 min"],
        exercises: [
          "Bench Step-Ups — 3 × 12 / leg",
          "Incline Push-Ups on bench — 4 × 10–12",
          "Walking Lunges — 3 × 12 / leg",
          "Pull-Up Bar Hangs / Assisted Pulls — 3 sets",
          "Brisk walk — 15 min",
        ],
        rest: "45–60 sec",
        progression: "Add reps or rounds before more intensity.",
        substitutions: ["Incline Push-Ups → wall push-ups", "Lunges → bodyweight squats"],
      },
      {
        day: "Wednesday",
        focus: "Outdoor Cardio + Core",
        warmup: ["Walk 5 min"],
        exercises: [
          "Fast walk / easy jog — 25–35 min",
          "Plank — 3 × 30–40 sec",
          "Bench knee raises — 3 × 15",
          "Stair climb intervals — 6 rounds",
        ],
        rest: "As needed",
        progression: "Increase pace or interval count gradually.",
        substitutions: ["Jog → brisk walk", "Stairs → hill walk"],
      },
      {
        day: "Friday",
        focus: "Outdoor Mixed Session",
        warmup: ["Walk 5 min", "Mobility"],
        exercises: [
          "Bodyweight Squat — 3 × 15",
          "Push-Ups — 3 × 10",
          "Walking Lunges — 3 × 10 / leg",
          "Hill walk — 15–20 min",
          "Backpack carry walk — 10 min",
        ],
        rest: "30–45 sec",
        progression: "Add time and reps gradually.",
        substitutions: ["Hill walk → flat brisk walk", "Push-Ups → incline push-ups"],
      },
    ],
    muscle_gain: [
      {
        day: "Monday",
        focus: "Outdoor Upper Body",
        warmup: ["Arm circles", "Band warm-up if available"],
        exercises: [
          "Push-Ups — 4 × 10–15",
          "Dips on bars / bench — 3 × 8–12",
          "Pull-Ups / Assisted Pull-Ups — 4 sets",
          "Backpack Curl — 3 × 12",
          "Band Lateral Raise — 3 × 15",
        ],
        rest: "60–90 sec",
        progression: "Add reps, then backpack resistance.",
        substitutions: ["Pull-Ups → inverted rows", "Dips → close-grip push-ups"],
      },
      {
        day: "Wednesday",
        focus: "Outdoor Lower Body",
        warmup: ["Walk 5 min", "Leg swings"],
        exercises: [
          "Bulgarian Split Squat on bench — 4 × 8–10 / leg",
          "Walking Lunges — 4 × 12 / leg",
          "Backpack Romanian Deadlift — 4 × 10",
          "Calf Raises — 4 × 20",
          "Hill walk — 10–15 min",
        ],
        rest: "60–75 sec",
        progression: "Increase backpack load or total reps.",
        substitutions: ["Bulgarian Split Squat → Step-Ups", "Hill walk → flat brisk walk"],
      },
      {
        day: "Friday",
        focus: "Outdoor Full Body Pump",
        warmup: ["Walk 5 min", "Mobility"],
        exercises: [
          "Push-Ups — 3 × 12",
          "Pull-Up variation — 3 sets",
          "Bodyweight Squat — 3 × 15",
          "Bench Dips — 3 × 12",
          "Carry backpack walk — 10 min",
        ],
        rest: "45–60 sec",
        progression: "Increase density and total work.",
        substitutions: ["Pull-Up variation → inverted row", "Bench Dips → push-ups"],
      },
    ],
    recomposition: [
      {
        day: "Monday",
        focus: "Outdoor Strength Base",
        warmup: ["Walk 5 min", "Mobility"],
        exercises: [
          "Bench Step-Ups — 4 × 10 / leg",
          "Push-Ups — 4 × 10",
          "Pull-Ups / Assisted Rows — 4 sets",
          "Walking Lunges — 3 × 10 / leg",
          "Plank — 3 × 40 sec",
        ],
        rest: "60 sec",
        progression: "Add reps or harder variations gradually.",
        substitutions: ["Pull-Ups → inverted rows", "Step-Ups → bodyweight squats"],
      },
      {
        day: "Wednesday",
        focus: "Outdoor Cardio + Hypertrophy",
        warmup: ["Walk 5 min"],
        exercises: [
          "Fast walk / jog — 20 min",
          "Push-Ups — 3 × 12",
          "Bodyweight Squat — 3 × 15",
          "Band Row / Inverted Row — 3 × 12",
          "Core work — 3 sets",
        ],
        rest: "45–60 sec",
        progression: "Increase pace or total reps week to week.",
        substitutions: ["Jog → brisk walk", "Band Row → backpack row"],
      },
      {
        day: "Friday",
        focus: "Outdoor Full Body",
        warmup: ["Walk 5 min", "Mobility"],
        exercises: [
          "Split Squat — 3 × 10 / leg",
          "Push-Ups — 3 × 10–12",
          "Pull-Up / Row variation — 3 sets",
          "Hill walk — 15 min",
          "Leg Raises — 3 × 15",
        ],
        rest: "45–60 sec",
        progression: "Add quality before intensity.",
        substitutions: ["Pull-Up variation → inverted row", "Hill walk → flat walk"],
      },
    ],
    health: [
      {
        day: "Monday",
        focus: "Outdoor Full Body",
        warmup: ["Walk 5 min", "Mobility"],
        exercises: [
          "Bodyweight Squat — 3 × 10",
          "Incline Push-Ups — 3 × 8–10",
          "Step-Ups — 3 × 10 / leg",
          "Band Row / Towel Row — 3 × 10",
          "Walk — 15 min",
        ],
        rest: "45 sec",
        progression: "Build consistency and easy recovery.",
        substitutions: ["Incline Push-Ups → wall push-ups", "Band Row → backpack row"],
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
        substitutions: ["Brisk walk → bike ride"],
      },
      {
        day: "Friday",
        focus: "Outdoor Strength + Conditioning",
        warmup: ["Walk 5 min", "Mobility"],
        exercises: [
          "Walking Lunges — 3 × 10 / leg",
          "Push-Ups — 3 × 8–10",
          "Bodyweight Squat — 3 × 12",
          "Bench step-ups — 3 × 10 / leg",
          "Walk — 15 min",
        ],
        rest: "45 sec",
        progression: "Add reps and total time gradually.",
        substitutions: ["Walking Lunges → split squats", "Push-Ups → incline push-ups"],
      },
    ],
  };

  let plan = gymPlans[goal];
  if (trainingMode === "home") plan = homePlans[goal];
  if (trainingMode === "outdoor") plan = outdoorPlans[goal];

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
        substitutions: ["Zone 2 cardio → brisk walk / bike / easy jog"],
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
  const [photoError, setPhotoError] = useState("");
  const [dnaFile, setDnaFile] = useState<File | null>(null);

  const fileLabel = useMemo(() => {
    if (!file) return "No photo selected";
    return `${file.name} (${Math.round(file.size / 1024)} KB)`;
  }, [file]);

  const dnaLabel = useMemo(() => {
    if (!dnaFile) return "No DNA file selected";
    return `${dnaFile.name} (${Math.round(dnaFile.size / 1024)} KB)`;
  }, [dnaFile]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;

    setPhotoError("");
    setAnalysis(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (!picked) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!SUPPORTED_IMAGE_TYPES.includes(picked.type)) {
      setFile(null);
      setPreviewUrl(null);
      setPhotoError("Unsupported format. Use JPG, PNG, WEBP, HEIC or HEIF.");
      return;
    }

    if (picked.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFile(null);
      setPreviewUrl(null);
      setPhotoError(`Image too large. Max ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    let processedFile = picked;

    if (picked.type === "image/heic" || picked.type === "image/heif") {
      try {
        const converted = await heic2any({
          blob: picked,
          toType: "image/jpeg",
          quality: 0.9,
        });

        const convertedBlob = Array.isArray(converted) ? converted[0] : converted;

        processedFile = new File(
          [convertedBlob as Blob],
          picked.name.replace(/\.(heic|heif)$/i, ".jpg"),
          { type: "image/jpeg" }
        );
      } catch {
        setFile(null);
        setPreviewUrl(null);
        setPhotoError("Could not convert HEIC/HEIF. Try another image or save it as JPG.");
        return;
      }
    }

    setFile(processedFile);
    setPreviewUrl(URL.createObjectURL(processedFile));
  }

  function onPickDnaFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    setDnaFile(picked);
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
                  <div style={{ fontSize: 13 }}>Upload a clear body photo from phone or computer.</div>
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
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: 13, opacity: 0.82, marginBottom: 8 }}>Body photo</div>
              <div style={{ fontSize: 12, opacity: 0.72, marginBottom: 8 }}>{fileLabel}</div>
              <div style={{ fontSize: 12, opacity: 0.58, marginBottom: 8 }}>
                Supported: JPG, PNG, WEBP, HEIC, HEIF · Max {MAX_FILE_SIZE_MB}MB
              </div>
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
                Choose file / Take photo
              </div>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                capture="environment"
                onChange={onPickFile}
                style={{ display: "none" }}
              />
            </label>

            {photoError ? (
              <div
                style={{
                  marginBottom: 16,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(239,68,68,0.14)",
                  border: "1px solid rgba(239,68,68,0.26)",
                  color: "#fecaca",
                  fontSize: 13,
                }}
              >
                {photoError}
              </div>
            ) : (
              <div style={{ marginBottom: 16, fontSize: 12, opacity: 0.55 }}>
                Next step later: AI check to reject random non-human images.
              </div>
            )}

            <div
              style={{
                marginBottom: 16,
                padding: 14,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.20)",
              }}
            >
              <div style={{ fontSize: 13, opacity: 0.82, marginBottom: 8 }}>DNA analysis</div>
              <div style={{ fontSize: 12, opacity: 0.72, marginBottom: 8 }}>{dnaLabel}</div>
              <div style={{ fontSize: 12, opacity: 0.58, marginBottom: 8 }}>
                Supported: TXT, CSV, PDF
              </div>
              <label
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.08)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Upload DNA file
                <input
                  type="file"
                  accept=".txt,.csv,.pdf"
                  onChange={onPickDnaFile}
                  style={{ display: "none" }}
                />
              </label>
            </div>

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
                    {dnaFile
                      ? `DNA file added: ${dnaFile.name}. This layer can later refine nutrient tolerance, recovery emphasis and training-response assumptions.`
                      : "Upload a DNA report to unlock deeper personalization later. This layer can refine nutrient tolerance, recovery emphasis, and training response assumptions."}
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