# FitPulse — Database Architecture & MongoDB Schema Design

## 1. Executive Summary & Design Philosophy
**FitPulse** utilizes a document-oriented database model via **MongoDB 8.x** and **Mongoose ODM**. The schema architecture balances read-heavy dashboard aggregations with granular write operations (such as multi-set workout logging and itemized meal tracking).

A strict design philosophy governs document modeling:
- **Embedded Documents** are used for data entities that strictly exist in the context of their parent record and are accessed together (e.g. workout sets inside an exercise session, item-level nutritional snapshots inside a meal log).
- **Referenced Documents (ObjectIds)** are used across autonomous entities with independent lifecycles (e.g. users, distinct food catalog entries, workout templates).

---

## 2. Collection Schemas & Relationships

### Collection 1: `users`
Core user identity and biometric preferences.

```typescript
{
  _id: ObjectId,
  name: String (required, minlength: 2),
  email: String (required, unique, indexed),
  passwordHash: String (select: false),
  dateOfBirth: Date (optional),
  height: Number (in cm, 50-300),
  currentWeight: Number (in kg, 20-500),
  activityLevel: Enum ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
  fitnessGoal: Enum ['muscle_gain', 'fat_loss', 'weight_maintenance', 'general_fitness', 'improved_endurance'],
  timezone: String (default: 'UTC'),
  preferences: {
    measurementUnits: Enum ['metric', 'imperial'],
    dailyStepGoal: Number (default: 10000),
    dailyCalorieGoal: Number (default: 2200),
    dailyWaterGoal: Number (default: 2500),
    dailySleepGoal: Number (default: 480) // 8 hrs in minutes
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Collection 2: `activity_logs`
Chronological daily step activity and walking biometrics.
- **Index:** Compound `{ userId: 1, date: -1 }` (unique constraint guarantees 1 consolidated record per day per user).

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', indexed),
  date: String (format: 'YYYY-MM-DD', indexed),
  steps: Number (min: 0),
  distanceKm: Number,
  estimatedCaloriesBurned: Number,
  source: Enum ['manual', 'sync', 'wearable'],
  createdAt: Date,
  updatedAt: Date
}
```

### Collection 3: `food_items`
System food database (including 40+ Indian traditional staples and common foods) and custom user-created foods.
- **Index:** Text index on `{ name: 'text', category: 'text' }`.

```typescript
{
  _id: ObjectId,
  name: String (indexed),
  category: String,
  servingSize: Number,
  servingUnit: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  fiber: Number,
  createdBy: ObjectId (ref: 'User', null for system catalog),
  isPublic: Boolean (default: true)
}
```

### Collection 4: `meal_logs`
User meal consumption records.
- **Design Decision — Historical Nutritional Snapshots:** Each meal embeds the exact macro values at the time of logging. If the global food catalog entry changes later, historical meal calories and macros remain mathematically preserved.

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', indexed),
  date: String (format: 'YYYY-MM-DD', indexed),
  mealType: Enum ['breakfast', 'lunch', 'dinner', 'snack', 'drink'],
  items: [
    {
      _id: ObjectId,
      foodItemId: ObjectId (ref: 'FoodItem', optional),
      name: String,
      servingSize: Number,
      servingUnit: String,
      quantity: Number,
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number
    }
  ],
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFat: Number,
  totalFiber: Number,
  createdAt: Date
}
```

### Collection 5: `workout_logs`
Exercise sessions and sets.
- **Design Decision — Embedded Exercises & Sets:** Sets belong exclusively to a single workout session. Storing them embedded provides high locality of reference without expensive joins.

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', indexed),
  date: String (format: 'YYYY-MM-DD', indexed),
  workoutType: Enum ['strength_training', 'cardio', 'yoga', 'pilates', 'walking', 'running', 'cycling', 'mobility', 'custom'],
  durationMinutes: Number,
  exercises: [
    {
      _id: ObjectId,
      exerciseName: String,
      sets: [
        {
          setNumber: Number,
          reps: Number,
          weightKg: Number,
          restTimeSeconds: Number
        }
      ],
      notes: String
    }
  ],
  estimatedCaloriesBurned: Number,
  notes: String,
  createdAt: Date
}
```

### Collection 6: `sleep_logs`
Sleep monitoring records.
- **Design Decision — Timezone & Midnight Support:** Stores `sleepStart` and `sleepEnd` as full UTC ISO timestamps. Accommodates sleep crossing midnight reliably (e.g. 23:30 to 07:15).

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', indexed),
  sleepStart: Date (indexed),
  sleepEnd: Date,
  durationMinutes: Number,
  quality: Number (1-5 scale),
  notes: String
}
```

### Collection 7: `water_logs`
Hydration intake logs.

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', indexed),
  timestamp: Date (default: Date.now, indexed),
  amountMl: Number
}
```

### Collection 8: `body_measurements`
Anthropometric progression.

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', indexed),
  date: String (format: 'YYYY-MM-DD', indexed),
  weightKg: Number,
  waistCm: Number,
  hipCm: Number,
  chestCm: Number,
  armCm: Number,
  thighCm: Number,
  notes: String
}
```

### Collection 9: `goals`
Target parameters.

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', indexed),
  goalType: Enum ['steps', 'calories', 'protein', 'water', 'sleep', 'workouts', 'weight'],
  targetValue: Number,
  unit: String,
  effectiveFrom: Date,
  effectiveTo: Date,
  isActive: Boolean (default: true)
}
```

### Collection 10: `workout_templates`
Reusable training routines.

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', indexed),
  name: String,
  category: String,
  exercises: [
    {
      exerciseName: String,
      defaultSets: Number,
      defaultReps: Number,
      defaultWeightKg: Number
    }
  ]
}
```

---

## 3. Database Indexes & Performance Optimization
Every query path in FitPulse is covered by an index to avoid full collection scans (`COLLSCAN`):

1. **`users.email`**: Unique single-field index for $O(1)$ login lookups.
2. **`activity_logs.{userId: 1, date: -1}`**: Compound unique index enabling instant daily retrieval and preventing double-logging.
3. **`meal_logs.{userId: 1, date: -1}`**: Compound index for date-filtered meal lookups.
4. **`workout_logs.{userId: 1, date: -1}`**: Compound index for weekly timeline queries.
5. **`sleep_logs.{userId: 1, sleepStart: -1}`**: Compound index for recent sleep analysis.
6. **`water_logs.{userId: 1, timestamp: -1}`**: Compound index for daily hydration sum.
7. **`food_items.{name: "text", category: "text"}`**: Full-text search index with language stemming for fast catalog search.
8. **`body_measurements.{userId: 1, date: -1}`**: Compound index for weight progression line charts.
9. **`goals.{userId: 1, goalType: 1, isActive: -1}`**: Compound index for fast active target resolution.

---

## 4. Multi-Tenant User Isolation
Every private query matches on `req.user.id` extracted from the cryptographically verified JWT token. Users can never read, modify, or delete records belonging to other athletes.
