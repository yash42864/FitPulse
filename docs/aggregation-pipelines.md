# FitPulse — Advanced MongoDB Aggregation Pipelines

## Academic Overview
A core requirement of **FitPulse** is executing non-trivial data reductions and analytical reporting directly inside the database cluster rather than hauling unindexed raw arrays into Node.js runtime memory.

All 8 aggregation pipelines below are implemented in `backend/src/services/analyticsService.ts` and evaluated during runtime through `/api/analytics/*` endpoints.

---

### Pipeline 1: Weekly Step Analysis
**Target Collection:** `activity_logs`
**Academic Goal:** Groups step records by calendar day within a date window, computes total steps, distance, walking calories, and summarizes averages and peak volume using `$facet` or multi-stage grouping.

```javascript
[
  {
    $match: {
      userId: ObjectId("..."),
      date: { $gte: "2026-10-01", $lte: "2026-10-07" }
    }
  },
  {
    $group: {
      _id: "$date",
      totalSteps: { $sum: "$steps" },
      totalDistanceKm: { $sum: "$distanceKm" },
      totalCaloriesBurned: { $sum: "$estimatedCaloriesBurned" },
      logCount: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      date: "$_id",
      steps: "$totalSteps",
      distanceKm: { $round: ["$totalDistanceKm", 2] },
      caloriesBurned: "$totalCaloriesBurned"
    }
  },
  { $sort: { date: 1 } }
]
```

---

### Pipeline 2: Nutrition Analysis
**Target Collection:** `meal_logs`
**Academic Goal:** Unwinds meal items, groups by meal category and calendar day, and aggregates total macronutrients (protein, carbs, fats, fiber) and calorie intake.

```javascript
[
  {
    $match: {
      userId: ObjectId("..."),
      date: { $gte: "2026-10-01", $lte: "2026-10-07" }
    }
  },
  {
    $group: {
      _id: "$date",
      totalCalories: { $sum: "$totalCalories" },
      totalProtein: { $sum: "$totalProtein" },
      totalCarbs: { $sum: "$totalCarbs" },
      totalFat: { $sum: "$totalFat" },
      totalFiber: { $sum: "$totalFiber" },
      mealsCount: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      date: "$_id",
      calories: { $round: ["$totalCalories", 0] },
      protein: { $round: ["$totalProtein", 1] },
      carbs: { $round: ["$totalCarbs", 1] },
      fat: { $round: ["$totalFat", 1] },
      fiber: { $round: ["$totalFiber", 1] },
      mealsCount: 1
    }
  },
  { $sort: { date: 1 } }
]
```

---

### Pipeline 3: Workout Analysis & Training Volume
**Target Collection:** `workout_logs`
**Academic Goal:** Computes total training volume across exercises by unwinding nested sets, calculating $Volume = Reps \times Weight$, and grouping by exercise name and category.

```javascript
[
  { $match: { userId: ObjectId("...") } },
  { $unwind: "$exercises" },
  { $unwind: "$exercises.sets" },
  {
    $project: {
      exerciseName: "$exercises.exerciseName",
      setVolume: {
        $multiply: [
          { $ifNull: ["$exercises.sets.reps", 0] },
          { $ifNull: ["$exercises.sets.weightKg", 0] }
        ]
      },
      weight: "$exercises.sets.weightKg",
      reps: "$exercises.sets.reps"
    }
  },
  {
    $group: {
      _id: "$exerciseName",
      totalVolumeKg: { $sum: "$setVolume" },
      maxWeightLifted: { $max: "$weight" },
      totalSets: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      exerciseName: "$_id",
      totalVolumeKg: { $round: ["$totalVolumeKg", 1] },
      maxWeightLifted: 1,
      totalSets: 1
    }
  },
  { $sort: { totalVolumeKg: -1 } },
  { $limit: 10 }
]
```

---

### Pipeline 4: Sleep Analysis & Consistency Score
**Target Collection:** `sleep_logs`
**Academic Goal:** Aggregates sleep durations, computes mean quality, and evaluates statistical variance via `$stdDevPop` to generate a sleep schedule consistency index.

```javascript
[
  { $match: { userId: ObjectId("...") } },
  {
    $group: {
      _id: null,
      avgDurationMinutes: { $avg: "$durationMinutes" },
      avgQuality: { $avg: "$quality" },
      minDurationMinutes: { $min: "$durationMinutes" },
      maxDurationMinutes: { $max: "$durationMinutes" },
      stdDevDuration: { $stdDevPop: "$durationMinutes" },
      totalEntries: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      avgDurationHours: { $round: [{ $divide: ["$avgDurationMinutes", 60] }, 1] },
      avgQuality: { $round: ["$avgQuality", 1] },
      sleepConsistencyScore: {
        $max: [
          0,
          {
            $round: [
              { $subtract: [100, { $multiply: [{ $ifNull: ["$stdDevDuration", 0] }, 0.5] }] },
              0
            ]
          }
        ]
      }
    }
  }
]
```

---

### Pipeline 5: Calorie Balance Analysis ($lookup Join)
**Target Collection:** `activity_logs` joining `meallogs` and `workoutlogs`
**Academic Goal:** Correlates daily caloric intake with walking expenditure and structured workout expenditure using `$lookup` sub-pipelines.

```javascript
[
  { $match: { userId: ObjectId("...") } },
  {
    $lookup: {
      from: "meallogs",
      let: { logDate: "$date", uId: "$userId" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$userId", "$$uId"] }, { $eq: ["$date", "$$logDate"] }]
            }
          }
        },
        { $group: { _id: null, totalConsumed: { $sum: "$totalCalories" } } }
      ],
      as: "mealData"
    }
  },
  {
    $lookup: {
      from: "workoutlogs",
      let: { logDate: "$date", uId: "$userId" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$userId", "$$uId"] }, { $eq: ["$date", "$$logDate"] }]
            }
          }
        },
        { $group: { _id: null, workoutBurned: { $sum: "$estimatedCaloriesBurned" } } }
      ],
      as: "workoutData"
    }
  },
  {
    $project: {
      _id: 0,
      date: "$date",
      caloriesConsumed: { $ifNull: [{ $arrayElemAt: ["$mealData.totalConsumed", 0] }, 0] },
      walkingBurned: "$estimatedCaloriesBurned",
      workoutBurned: { $ifNull: [{ $arrayElemAt: ["$workoutData.workoutBurned", 0] }, 0] }
    }
  },
  {
    $project: {
      date: 1,
      caloriesConsumed: 1,
      totalBurned: { $add: ["$walkingBurned", "$workoutBurned"] },
      netBalance: {
        $subtract: [
          "$caloriesConsumed",
          { $add: ["$walkingBurned", "$workoutBurned"] }
        ]
      }
    }
  },
  { $sort: { date: 1 } }
]
```

---

### Pipeline 6: Monthly Progress Aggregation
**Target Collections:** `activity_logs`, `workout_logs`, `body_measurements`
**Academic Goal:** Extracts month strings via `$substr` (YYYY-MM), grouping monthly step volume, workout minutes, and calculating net body weight change ($Last - First$).

```javascript
[
  { $match: { userId: ObjectId("...") } },
  { $sort: { date: 1 } },
  {
    $group: {
      _id: { $substr: ["$date", 0, 7] },
      firstWeight: { $first: "$weightKg" },
      lastWeight: { $last: "$weightKg" },
      avgWeight: { $avg: "$weightKg" },
      entryCount: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 1,
      firstWeight: 1,
      lastWeight: 1,
      avgWeight: { $round: ["$avgWeight", 1] },
      weightChange: { $round: [{ $subtract: ["$lastWeight", "$firstWeight"] }, 2] },
      entryCount: 1
    }
  },
  { $sort: { _id: 1 } }
]
```

---

### Pipeline 7: Privacy-Preserving Activity Leaderboard
**Target Collection:** `activity_logs` joining `users`
**Academic Goal:** Aggregates multi-user activity over the last 7 days, performs `$lookup` to get user profile, and anonymizes display name ($First Name + Initial$).

```javascript
[
  { $match: { date: { $gte: "2026-10-23" } } },
  {
    $group: {
      _id: "$userId",
      totalSteps: { $sum: "$steps" },
      activeDays: { $sum: 1 },
      avgDailySteps: { $avg: "$steps" }
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "userInfo"
    }
  },
  { $unwind: "$userInfo" },
  {
    $project: {
      _id: 1,
      displayName: {
        $concat: [
          { $arrayElemAt: [{ $split: ["$userInfo.name", " "] }, 0] },
          " ",
          { $substrCP: [{ $ifNull: [{ $arrayElemAt: [{ $split: ["$userInfo.name", " "] }, 1] }, ""] }, 0, 1] },
          "."
        ]
      },
      totalSteps: 1,
      avgDailySteps: { $round: ["$avgDailySteps", 0] },
      activeDays: 1
    }
  },
  { $sort: { totalSteps: -1 } },
  { $limit: 10 }
]
```

---

### Pipeline 8: Lifestyle Consistency Score (Composite Habit Index)
**Academic Goal:** Synthesizes multi-domain habit compliance across 5 pillars:
1. **Steps Goal Adherence (25% Weight)**
2. **Workout Regularity (25% Weight)**
3. **Sleep Target Adherence (20% Weight)**
4. **Hydration Consistency (15% Weight)**
5. **Nutrition Logging Consistency (15% Weight)**

Formula:
$$Score = \sum (Weight_i \times Adherence_i) \quad [0 - 100]$$

Clearly presented as an algorithmic habit-tracking index rather than a clinical medical risk diagnosis.
