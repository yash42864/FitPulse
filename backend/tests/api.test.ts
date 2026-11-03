import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { ActivityLog } from '../src/models/ActivityLog.js';
import { MealLog } from '../src/models/MealLog.js';
import { WorkoutLog } from '../src/models/WorkoutLog.js';
import { SleepLog } from '../src/models/SleepLog.js';
import { WaterLog } from '../src/models/WaterLog.js';
import { calculateSleepDurationMinutes } from '../src/utils/calculations.js';

const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitpulse_test';

let userAToken = '';
let userBToken = '';
let userAId = '';
let userBId = '';

beforeAll(async () => {
  // Connect to test database
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB_URI);
  }
  // Clear test database collections
  await Promise.all([
    User.deleteMany({ email: { $in: ['test_user_a@fitpulse.app', 'test_user_b@fitpulse.app'] } }),
    ActivityLog.deleteMany({}),
    MealLog.deleteMany({}),
    WorkoutLog.deleteMany({}),
    SleepLog.deleteMany({}),
    WaterLog.deleteMany({}),
  ]);
});

afterAll(async () => {
  // Cleanup and disconnect
  await Promise.all([
    User.deleteMany({ email: { $in: ['test_user_a@fitpulse.app', 'test_user_b@fitpulse.app'] } }),
    ActivityLog.deleteMany({}),
    MealLog.deleteMany({}),
    WorkoutLog.deleteMany({}),
    SleepLog.deleteMany({}),
    WaterLog.deleteMany({}),
  ]);
  await mongoose.disconnect();
});

describe('1. Authentication & Security Tests', () => {
  it('should register a new user successfully (User A)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Alpha',
        email: 'test_user_a@fitpulse.app',
        password: 'Password123!',
        height: 175,
        currentWeight: 72,
        fitnessGoal: 'muscle_gain',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test_user_a@fitpulse.app');
    userAToken = res.body.token;
    userAId = res.body.user.id;
  });

  it('should prevent registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Duplicate',
        email: 'test_user_a@fitpulse.app',
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should register second user (User B) for isolation tests', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Beta',
        email: 'test_user_b@fitpulse.app',
        password: 'Password123!',
        height: 180,
        currentWeight: 80,
      });

    expect(res.status).toBe(201);
    userBToken = res.body.token;
    userBId = res.body.user.id;
  });

  it('should authenticate user login and return valid JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test_user_a@fitpulse.app',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test_user_a@fitpulse.app',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject unauthorized request without token', async () => {
    const res = await request(app).get('/api/users/profile');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('2. Activity & Steps Endpoint Tests', () => {
  it('should log daily steps and calculate distance and walking calories', async () => {
    const res = await request(app)
      .post('/api/activity')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        date: '2026-10-15',
        steps: 10000,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.steps).toBe(10000);
    // 10000 steps with height 175 should be ~7.24 km
    expect(res.body.data.distanceKm).toBeGreaterThan(6.0);
    expect(res.body.data.estimatedCaloriesBurned).toBeGreaterThan(300);

    // Verify persistence in MongoDB
    const persisted = await ActivityLog.findOne({ userId: userAId, date: '2026-10-15' });
    expect(persisted).not.toBeNull();
    expect(persisted?.steps).toBe(10000);
  });

  it('should retrieve activity history for User A', async () => {
    const res = await request(app)
      .get('/api/activity')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should verify User B cannot see User A activity records (User Isolation)', async () => {
    const res = await request(app)
      .get('/api/activity')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(200);
    // User B should have 0 records
    expect(res.body.data.length).toBe(0);
  });
});

describe('3. Nutrition & Meal Tracking Tests', () => {
  it('should log a meal and automatically compute total calories and macros', async () => {
    const res = await request(app)
      .post('/api/meals')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        date: '2026-10-15',
        mealType: 'lunch',
        items: [
          {
            name: 'Roti',
            servingSize: 40,
            servingUnit: 'piece',
            quantity: 2,
            calories: 104,
            protein: 3.1,
            carbs: 20.2,
            fat: 0.9,
            fiber: 2.8,
          },
          {
            name: 'Dal Tadka',
            servingSize: 150,
            servingUnit: 'bowl',
            quantity: 1,
            calories: 150,
            protein: 9.2,
            carbs: 19.8,
            fat: 3.8,
            fiber: 4.5,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // 2 * 104 + 150 = 358 calories
    expect(res.body.data.totalCalories).toBe(358);
    expect(res.body.data.totalProtein).toBeCloseTo(15.4, 1);
  });
});

describe('4. Workout Tracking Tests', () => {
  it('should log a workout with exercises and calculate calories burned', async () => {
    const res = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        date: '2026-10-15',
        workoutType: 'strength_training',
        durationMinutes: 60,
        exercises: [
          {
            exerciseName: 'Bench Press',
            sets: [
              { setNumber: 1, reps: 10, weightKg: 60, restTimeSeconds: 60 },
              { setNumber: 2, reps: 8, weightKg: 70, restTimeSeconds: 90 },
            ],
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.durationMinutes).toBe(60);
    expect(res.body.data.estimatedCaloriesBurned).toBeGreaterThan(200);
  });
});

describe('5. Sleep Tracking & Midnight Crossing Tests', () => {
  it('should calculate sleep duration accurately across midnight', () => {
    const sleepStart = '2026-10-14T23:30:00.000Z';
    const sleepEnd = '2026-10-15T07:30:00.000Z';
    const duration = calculateSleepDurationMinutes(sleepStart, sleepEnd);
    // 23:30 to 07:30 = 8 hours = 480 minutes
    expect(duration).toBe(480);
  });

  it('should log a sleep entry via API', async () => {
    const res = await request(app)
      .post('/api/sleep')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        sleepStart: '2026-10-14T23:30:00.000Z',
        sleepEnd: '2026-10-15T07:30:00.000Z',
        quality: 5,
        notes: 'Deep uninterrupted sleep',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.durationMinutes).toBe(480);
    expect(res.body.data.quality).toBe(5);
  });
});

describe('6. Hydration Tracking Tests', () => {
  it('should log water consumption intake', async () => {
    const res = await request(app)
      .post('/api/water')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        amountMl: 500,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amountMl).toBe(500);
  });
});

describe('7. MongoDB Aggregation Analytics Tests', () => {
  it('should return aggregated dashboard overview using real MongoDB pipelines', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard?date=2026-10-15')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.kpis).toBeDefined();
    expect(res.body.data.kpis.steps.current).toBe(10000);
    expect(res.body.data.kpis.nutrition.protein).toBeGreaterThan(0);
    expect(res.body.data.visualizations).toBeDefined();
    expect(res.body.data.visualizations.consistencyScore).toBeDefined();
  });

  it('should return weekly steps analysis aggregation pipeline result', async () => {
    const res = await request(app)
      .get('/api/analytics/steps?startDate=2026-10-01&endDate=2026-10-20')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.dailyBreakdown).toBeInstanceOf(Array);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.summary.totalSteps).toBeGreaterThanOrEqual(10000);
  });
});
