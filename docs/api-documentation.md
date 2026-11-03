# FitPulse — REST API Specification & Endpoint Documentation

## Base URL
- Local Development: `http://localhost:5000/api`
- Frontend Proxy: `/api`

## Security & Authentication
- All protected endpoints require a JWT token transmitted either via:
  - **HTTP-Only Cookie:** `token=<jwt>`
  - **Authorization Header:** `Bearer <jwt>`

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates a new athlete account.
- **Request Body:**
```json
{
  "name": "Alex Johnson",
  "email": "alex@fitpulse.app",
  "password": "Password123!",
  "height": 178,
  "currentWeight": 75.5,
  "activityLevel": "moderately_active",
  "fitnessGoal": "muscle_gain"
}
```
- **Responses:**
  - `201 Created`: User registered, JWT returned in JSON and set in HTTP-only cookie.
  - `400 Bad Request`: Validation failure.
  - `409 Conflict`: Email already registered.

### `POST /api/auth/login`
Authenticates existing user.
- **Request Body:**
```json
{
  "email": "alex@fitpulse.app",
  "password": "Password123!"
}
```
- **Responses:**
  - `200 OK`: Successful authentication.
  - `401 Unauthorized`: Invalid email or password.

### `POST /api/auth/logout`
Clears HTTP-only cookie session.
- **Responses:** `200 OK`.

### `GET /api/auth/me`
Fetches authenticated user identity.
- **Headers:** `Authorization: Bearer <token>`
- **Responses:** `200 OK`.

---

## 2. User Profile Endpoints (`/api/users`)

### `GET /api/users/profile`
Returns full profile and preferences.

### `PATCH /api/users/profile`
Updates profile parameters (height, weight, goals, units).

### `POST /api/users/change-password`
Changes account password. Requires verification of current password.

### `DELETE /api/users/account`
Cascades and permanently deletes user account and records across all 10 MongoDB collections.

---

## 3. Activity & Steps Endpoints (`/api/activity`)

### `GET /api/activity`
Retrieves paginated daily step records.
- **Query Params:**
  - `page` (default: 1)
  - `limit` (default: 30)
  - `startDate`, `endDate` (YYYY-MM-DD)

### `POST /api/activity`
Logs or updates step count for a specific date.
- **Request Body:**
```json
{
  "date": "2026-10-30",
  "steps": 10500,
  "source": "manual"
}
```
- **Automatic Calculations:** `distanceKm` and `estimatedCaloriesBurned` are computed server-side if omitted.

### `DELETE /api/activity/:id`
Deletes an activity record.

---

## 4. Nutrition Endpoints (`/api/foods`, `/api/meals`)

### `GET /api/foods`
Searches food items in the database.
- **Query Params:** `q` (search query), `category`.

### `POST /api/foods`
Creates a custom user-defined food item.

### `GET /api/meals`
Fetches meal logs for a date or date range.
- **Query Params:** `date=YYYY-MM-DD`.

### `POST /api/meals`
Logs a meal (breakfast, lunch, dinner, snack, drink).
- **Request Body:**
```json
{
  "date": "2026-10-30",
  "mealType": "lunch",
  "items": [
    {
      "foodItemId": "6ae47047833fb9b83baf11ca",
      "name": "Yellow Moong Dal Tadka",
      "servingSize": 150,
      "servingUnit": "bowl",
      "quantity": 1,
      "calories": 150,
      "protein": 9.2,
      "carbs": 19.8,
      "fat": 3.8,
      "fiber": 4.5
    }
  ]
}
```

### `DELETE /api/meals/:id`
Deletes a meal log.

---

## 5. Workouts Endpoints (`/api/workouts`)

### `GET /api/workouts`
Fetches paginated workout history.

### `POST /api/workouts`
Logs a workout with embedded exercise sets.
- **Request Body:**
```json
{
  "date": "2026-10-30",
  "workoutType": "strength_training",
  "durationMinutes": 60,
  "exercises": [
    {
      "exerciseName": "Barbell Squat",
      "sets": [
        { "setNumber": 1, "reps": 10, "weightKg": 70, "restTimeSeconds": 90 },
        { "setNumber": 2, "reps": 8, "weightKg": 80, "restTimeSeconds": 90 }
      ]
    }
  ],
  "notes": "Strong session"
}
```

### `GET /api/workouts/templates` & `POST /api/workouts/templates`
Retrieves and creates reusable workout templates.

---

## 6. Sleep Endpoints (`/api/sleep`)

### `GET /api/sleep`
Retrieves sleep logs.

### `POST /api/sleep`
Logs sleep start and end across midnight with 1-5 quality rating.
- **Request Body:**
```json
{
  "sleepStart": "2026-10-29T23:30:00.000Z",
  "sleepEnd": "2026-10-30T07:30:00.000Z",
  "quality": 5,
  "notes": "Fell asleep immediately, 8 hours uninterrupted"
}
```

---

## 7. Hydration Endpoints (`/api/water`)

### `GET /api/water`
Returns entries for target date and 7-day hydration trend.

### `POST /api/water`
Logs water intake.
- **Request Body:** `{ "amountMl": 500, "timestamp": "2026-10-30T10:00:00.000Z" }`

### `DELETE /api/water/:id`
Deletes a water entry.

---

## 8. Body Measurements (`/api/measurements`)

### `GET /api/measurements`
Retrieves body weight and circumference records and computes net delta.

### `POST /api/measurements`
Logs weight and body circumferences.
- **Request Body:**
```json
{
  "date": "2026-10-30",
  "weightKg": 75.5,
  "waistCm": 83.0,
  "hipCm": 98.0,
  "chestCm": 102.0
}
```

---

## 9. Fitness Goals (`/api/goals`)

### `GET /api/goals`
Retrieves all goals with calculated progress percentages.

### `POST /api/goals`
Establishes a new target for steps, calories, protein, water, sleep, workouts, or weight.

---

## 10. Analytics Endpoints (`/api/analytics`)

- `GET /api/analytics/dashboard?date=YYYY-MM-DD`: Overview KPI cards & visualizations.
- `GET /api/analytics/steps?startDate=...&endDate=...`: Pipeline 1 (weekly steps).
- `GET /api/analytics/nutrition?startDate=...&endDate=...`: Pipeline 2 (macros & calories).
- `GET /api/analytics/workouts`: Pipeline 3 (volume & category distribution).
- `GET /api/analytics/sleep`: Pipeline 4 (sleep duration & consistency index).
- `GET /api/analytics/calorie-balance`: Pipeline 5 ($lookup cross-collection join).
- `GET /api/analytics/progress`: Pipeline 6 (monthly aggregates).
- `GET /api/analytics/leaderboard`: Pipeline 7 (community activity rankings).
- `GET /api/analytics/consistency`: Pipeline 8 (composite lifestyle consistency score).
