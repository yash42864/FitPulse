FITPULSE INTELLIGENCE PLATFORM
SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
IEEE Std 830-1998 Compliant Document

PROJECT: FitPulse - Your Personal Fitness Intelligence Platform
VERSION: 1.0.0
DATE: November 2026

================================================================================
TABLE OF CONTENTS
================================================================================
1. INTRODUCTION
   1.1 Purpose
   1.2 Scope
   1.3 Definitions, Acronyms, and Abbreviations
   1.4 References
   1.5 Overview

2. GENERAL DESCRIPTION
   2.1 Product Perspective
   2.2 Product Functions
   2.3 User Characteristics
   2.4 General Constraints
   2.5 Assumptions and Dependencies

3. SPECIFIC REQUIREMENTS
   3.1 External Interface Requirements
       3.1.1 User Interfaces
       3.1.2 Hardware Interfaces
       3.1.3 Software Interfaces
       3.1.4 Communications Interfaces
   3.2 Functional Requirements
       3.2.1 User Authentication and Security Subsystem
       3.2.2 Activity Tracking Subsystem
       3.2.3 Nutrition and Food Catalog Subsystem
       3.2.4 Workout Logging and Template Subsystem
       3.2.5 Sleep Architecture and Recovery Subsystem
       3.2.6 Hydration Management Subsystem
       3.2.7 Anthropometric Measurement Subsystem
       3.2.8 Goal Setting and Progression Subsystem
       3.2.9 MongoDB Multi-Stage Analytics Engine
       3.2.10 Community Leaderboard Subsystem
   3.5 Non-Functional Requirements
       3.5.1 Performance Requirements
       3.5.2 Reliability Requirements
       3.5.3 Availability Requirements
       3.5.4 Security Requirements
       3.5.5 Maintainability Requirements
       3.5.6 Portability Requirements
   3.7 Design Constraints
   3.9 Other Requirements

4. ANALYSIS MODELS
   4.1 Use Case Model
   4.2 Data Flow Model
       4.2.1 Context Diagram (DFD Level 0)
       4.2.2 System Decomposition Diagram (DFD Level 1)
       4.2.3 Process 4.0 MongoDB Aggregation Engine (DFD Level 2)
   4.3 State Transition Model
   4.4 Entity Relationship and Document Modeling

A. APPENDICES
   A.1 MongoDB Collection Schemas and Indexing Specifications
   A.2 Starter Food Catalog and Regional Nutrition Table
   A.3 Physical Activity MET and Biometric Formulas
   A.4 Demonstration Script and Demo Credentials

================================================================================
1. INTRODUCTION
================================================================================

1.1 PURPOSE
The purpose of this document is to specify the complete software requirements for FitPulse, an enterprise-grade fitness, nutrition, and lifestyle intelligence web application powered by MongoDB Community Server 8.x, Express.js, React 18, Node.js, and TypeScript. This specification defines functional capabilities, external interfaces, non-functional performance benchmarks, MongoDB data schemas, aggregation pipelines, and design constraints in accordance with IEEE Std 830-1998 guidelines.

1.2 SCOPE
FitPulse provides individuals and health enthusiasts with unified tracking and algorithmic analytics across six core health pillars: physical activity, dietary nutrition, resistance and aerobic workouts, sleep architecture, daily hydration, and anthropometric body measurements. Rather than relying on static client-side computation or unindexed relational joins, FitPulse delegates complex analytical workloads to MongoDB aggregation pipelines, calculating net calorie balances, weekly volume tonnages, sleep variance consistency, and a composite Lifestyle Consistency Score (0-100). The scope includes web clients, RESTful APIs, data persistence, and administrative seeding.

1.3 DEFINITIONS, ACRONYMS, AND ABBREVIATIONS
- API: Application Programming Interface
- BMR: Basal Metabolic Rate, calculated via Mifflin-St Jeor formula
- BSON: Binary JavaScript Object Notation used by MongoDB
- CORS: Cross-Origin Resource Sharing
- DFD: Data Flow Diagram
- ESR: Equality, Sort, Range indexing rule for compound MongoDB indexes
- IEEE: Institute of Electrical and Electronics Engineers
- IXSCAN: Index Scan execution stage in MongoDB explain plans
- JWT: JSON Web Token used for stateless session authorization
- MERN: MongoDB, Express.js, React, Node.js full-stack architecture
- MET: Metabolic Equivalent of Task, used for exercise calorie computation
- RPE: Rate of Perceived Exertion (scale 1 to 10)
- SRS: Software Requirements Specification
- TDEE: Total Daily Energy Expenditure (BMR * Physical Activity Factor)
- URI: Uniform Resource Identifier

1.4 REFERENCES
- IEEE Std 830-1998, Recommended Practice for Software Requirements Specifications.
- MongoDB 8.x Manual, Aggregation Pipeline Architecture and Indexing Strategies.
- Mifflin, M. D., et al. (1990). A new predictive equation for resting energy expenditure in healthy individuals. The American Journal of Clinical Nutrition.
- Ainsworth, B. E., et al. (2011). Compendium of Physical Activities. Medicine and Science in Sports and Exercise.

1.5 OVERVIEW
The remainder of this document details product perspective, general user characteristics, functional requirements with input/process/output/error specifications, rigorous non-functional requirements, analysis models including three levels of Data Flow Diagrams, complete BSON schemas, and operational demonstration procedures.

================================================================================
2. GENERAL DESCRIPTION
================================================================================

2.1 PRODUCT PERSPECTIVE
FitPulse operates as a self-contained web platform designed to replace fragmented fitness trackers with a cohesive, document-oriented intelligence system. It interacts with local MongoDB instances, modern web browsers via HTTP/HTTPS, and JSON REST endpoints.

2.2 PRODUCT FUNCTIONS
- Authentication: Secure registration, bcrypt password hashing, and HttpOnly JWT issuance.
- Activity Logging: Recording daily step counts, automatic distance/calorie derivation, and hourly distribution.
- Nutrition Management: Food catalog lookup, meal logging (breakfast, lunch, dinner, snack), and macronutrient tracking.
- Workout Recording: Exercise sets, reps, load, RPE tracking, volume load calculations, and reusable templates.
- Sleep Monitoring: Bedtime, wake time, midnight crossing duration math, sleep efficiency, and stage breakdowns.
- Hydration Tracking: Cumulative daily fluid intake logging via bucket subdocuments.
- Anthropometric Tracking: Weight and circumference logging with BMI trend computation.
- Algorithmic Intelligence: 8 MongoDB aggregation pipelines computing calorie balance, macro distributions, tonnage, and composite consistency scoring.
- Community Engagement: Anonymized opt-in leaderboards ranking community activity.

2.3 USER CHARACTERISTICS
The primary users are health-conscious individuals, fitness trainees, athletes, and dieticians who possess basic familiarity with web interfaces and require daily tracking with actionable analytics.

2.4 GENERAL CONSTRAINTS
- Strict avoidance of bold formatting across reports and presentation decks.
- Zero mock or hardcoded dashboard metrics; all figures must originate from database queries.
- Compatibility with MongoDB 8.x running on port 27017.
- Complete execution of backend code within Node.js native ES Modules (ESM).
- 100 percent type-safety enforced by TypeScript across both backend and frontend layers.

2.5 ASSUMPTIONS AND DEPENDENCIES
- Modern web browser with ECMAScript 2022 and CSS Grid support (Chrome 90+, Firefox 88+, Edge 90+).
- Node.js runtime version 18.x, 20.x, or 22.x available on host.
- MongoDB Server 8.x active and listening on localhost:27017.

================================================================================
3. SPECIFIC REQUIREMENTS
================================================================================

3.1 EXTERNAL INTERFACE REQUIREMENTS
3.1.1 USER INTERFACES
The user interface is an interactive React 18 SPA utilizing Tailwind CSS with a dark-theme palette (#0B0F19 background, #151B2B card containers, #A3E635 electric lime accent, #8B5CF6 violet accent). Layout includes a persistent sidebar navigation bar, top breadcrumb header, interactive KPI stat cards, Recharts data visualizations, and contextual modal forms.

3.1.2 HARDWARE INTERFACES
Standard client display with minimum viewport resolution of 375x667 pixels (mobile) up to 3840x2160 pixels (4K desktop). Server hardware minimum: 1 vCPU, 2 GB RAM, 10 GB disk space.

3.1.3 SOFTWARE INTERFACES
- Database: MongoDB Community Server 8.x via official Mongoose ODM driver.
- Authentication: Stateless JWT tokens with 7-day expiration stored in HttpOnly secure cookies with fallback Authorization header.
- Frontend Build: Vite 5.x bundling React 18, React Router 6.x, Recharts, and Lucide React icons.

3.1.4 COMMUNICATIONS INTERFACES
All client-server exchanges use standard RESTful JSON over HTTP/1.1 or HTTP/2. Endpoints enforce CORS policies restricting origins to whitelisted frontend domains.

3.2 FUNCTIONAL REQUIREMENTS
3.2.1 USER AUTHENTICATION AND SECURITY SUBSYSTEM
3.2.1.1 Introduction: Provides user registration, credential authentication, profile management, and token revocation.
3.2.1.2 Inputs: Full name, unique email address, password (minimum 8 characters), gender, date of birth, height in cm, weight in kg, and fitness goal.
3.2.1.3 Processing: Zod schema validation; email canonicalization; password hashing using bcrypt with 10 salt rounds; BMR calculation using Mifflin-St Jeor equation; JWT generation containing user ObjectId.
3.2.1.4 Outputs: User profile object without passwordHash; signed JWT token.
3.2.1.5 Error Handling: HTTP 400 on malformed input; HTTP 409 on duplicate email; HTTP 401 on invalid credentials.

3.2.2 ACTIVITY TRACKING SUBSYSTEM
3.2.2.1 Introduction: Records and calculates daily movement metrics.
3.2.2.2 Inputs: Date string (YYYY-MM-DD), steps, active minutes, optional distance and calories override.
3.2.2.3 Processing: Distance derived from steps * (height * 0.415); active calories derived from MET formula; upserting document in activitylogs collection enforcing unique { userId: 1, date: -1 }.
3.2.2.4 Outputs: Persisted ActivityLog document; updated dashboard KPI.
3.2.2.5 Error Handling: HTTP 400 on negative steps or invalid date format.

3.2.3 NUTRITION AND FOOD CATALOG SUBSYSTEM
3.2.3.1 Introduction: Manages food items and daily meal logging.
3.2.3.2 Inputs: Meal type (breakfast, lunch, dinner, snack), array of items referencing foodItemId or custom items with serving sizes.
3.2.3.3 Processing: FoodItem text search using MongoDB $text index; snapshots food nutritional values into MealLog embedded items array; calculates cached totalCalories, totalProtein, totalCarbs, totalFat.
3.2.3.4 Outputs: Persisted MealLog document with embedded items.
3.2.3.5 Error Handling: HTTP 404 if foodItemId not found; HTTP 400 on negative quantities.

3.2.4 WORKOUT LOGGING AND TEMPLATE SUBSYSTEM
3.2.4.1 Introduction: Records resistance training, cardio sessions, and reusable templates.
3.2.4.2 Inputs: Title, date, duration, array of exercises containing category, sets (setNumber, weightKg, reps, rpe).
3.2.4.3 Processing: Aggregates totalVolumeKg = sum(weightKg * reps); validates RPE within 1 to 10; saves to workoutlogs collection.
3.2.4.4 Outputs: Saved WorkoutLog document with calculated volume load.
3.2.4.5 Error Handling: HTTP 400 on missing exercise names or negative weight/reps.

3.2.5 SLEEP ARCHITECTURE AND RECOVERY SUBSYSTEM
3.2.5.1 Introduction: Records nocturnal rest and sleep stage distributions.
3.2.5.2 Inputs: Date (assigned to morning of waking), bedtime ISO timestamp, wakeTime ISO timestamp, quality rating (1-5), optional sleep stages in minutes.
3.2.5.3 Processing: Calculates durationMinutes handling overnight boundaries crossing midnight; computes sleep efficiency = (duration - awakeMinutes) / duration * 100; upserts into sleeplogs with unique { userId: 1, date: -1 }.
3.2.5.4 Outputs: SleepLog document with total sleep duration and sleep quality index.
3.2.5.5 Error Handling: HTTP 400 if wakeTime occurs before bedtime or span exceeds 24 hours.

3.2.6 HYDRATION MANAGEMENT SUBSYSTEM
3.2.6.1 Introduction: Tracks daily water consumption using the MongoDB Bucket Pattern.
3.2.6.2 Inputs: Date (YYYY-MM-DD), amount in milliliters (e.g., 250, 500).
3.2.6.3 Processing: Finds existing WaterLog document for { userId, date } or initializes new one; pushes { timestamp, amountMl } to entries array; increments totalMl via atomic $inc operator.
3.2.6.4 Outputs: Updated WaterLog document with cumulative totalMl.
3.2.6.5 Error Handling: HTTP 400 on negative or zero intake values.

3.2.7 ANTHROPOMETRIC MEASUREMENT SUBSYSTEM
3.2.7.1 Introduction: Tracks longitudinal changes in body weight and body circumferences.
3.2.7.2 Inputs: Date, weightKg, bodyFatPercentage, chestCm, waistCm, hipsCm, thighsCm, bicepsCm.
3.2.7.3 Processing: Calculates BMI = weightKg / ((heightCm / 100) ^ 2); saves to bodymeasurements collection indexed on { userId: 1, date: -1 }.
3.2.7.4 Outputs: Saved BodyMeasurement document.
3.2.7.5 Error Handling: HTTP 400 if weight is outside physiological range (20kg to 350kg).

3.2.8 GOAL SETTING AND PROGRESSION SUBSYSTEM
3.2.8.1 Introduction: Manages quantitative health targets and tracks completion status.
3.2.8.2 Inputs: Category (steps, calories, sleep, water, weight, workouts), targetValue, unit, period (daily, weekly, monthly), targetDate.
3.2.8.3 Processing: Evaluates current user metrics; updates currentProgress; marks status as active or achieved.
3.2.8.4 Outputs: Saved Goal document.
3.2.8.5 Error Handling: HTTP 400 on invalid category or past targetDate.

3.2.9 MONGODB MULTI-STAGE ANALYTICS ENGINE
3.2.9.1 Introduction: Executes 8 server-side MongoDB aggregation pipelines for deep health insights.
3.2.9.2 Inputs: User ObjectId, startDate, endDate query parameters.
3.2.9.3 Processing: Executes pipelines including Calorie Balance ($lookup between activity, meals, workouts), Macro Distribution ($unwind, $group), Workout Tonnage ($unwind, $multiply, $group), Sleep Consistency ($stdDevPop), and Lifestyle Consistency Score ($facet running 5 parallel streams).
3.2.9.4 Outputs: Computed statistical metrics returned directly to client.
3.2.9.5 Error Handling: Graceful fallback to default zero structures when datasets contain fewer than 2 days of logs.

3.2.10 COMMUNITY LEADERBOARD SUBSYSTEM
3.2.10.1 Introduction: Ranks community step and workout volume performance with privacy masking.
3.2.10.2 Inputs: Optional timeframe parameter (7d, 30d, all-time).
3.2.10.3 Processing: Aggregates total steps from activitylogs; looks up user document; masks email (e.g., j***@domain.com); applies $sort and $limit 10.
3.2.10.4 Outputs: Array of ranked community leaderboard entries.
3.2.10.5 Error Handling: HTTP 500 handled by global Express error middleware.

3.5 NON-FUNCTIONAL REQUIREMENTS
3.5.1 PERFORMANCE REQUIREMENTS
- 95 percent of REST API requests shall respond in less than 50 milliseconds under standard load.
- MongoDB aggregation pipeline execution time shall not exceed 15 milliseconds for a 30-day time-series range.
- Frontend initial page load time shall be under 1.5 seconds on a standard 10 Mbps broadband connection.

3.5.2 RELIABILITY REQUIREMENTS
- Mean Time Between Failures (MTBF) shall exceed 720 operating hours.
- Database write operations must use acknowledged write concern (w: 1) ensuring disk persistence.
- Zero data corruption on time-series collections guaranteed through compound unique indexes.

3.5.3 AVAILABILITY REQUIREMENTS
- System availability shall exceed 99.5 percent uptime during scheduled operational windows.
- Database connection failure shall trigger automatic exponential backoff reconnection attempts up to 5 retries.

3.5.4 SECURITY REQUIREMENTS
- All user passwords shall be hashed with bcrypt using a work factor of 10.
- JWT tokens shall be signed with a minimum 256-bit secret and transmitted via HttpOnly, SameSite cookies.
- Helmet security middleware shall set HTTP security headers including X-Content-Type-Options: nosniff and X-Frame-Options: DENY.
- Rate limiting middleware shall restrict requests to 100 requests per 15-minute window per IP address.

3.5.5 MAINTAINABILITY REQUIREMENTS
- Backend and frontend codebases shall strictly enforce TypeScript type-safety with zero any escapes in production services.
- Clean separation of concerns: routes, controllers, middleware, validators, services, and models.
- Automated Jest integration test suite shall cover all authentication and aggregation endpoints.

3.5.6 PORTABILITY REQUIREMENTS
- Application backend shall run on any operating system supporting Node.js 18+ (Windows, Linux, macOS).
- Database layer shall be compatible with MongoDB Community Server 7.x and 8.x, as well as MongoDB Atlas cloud clusters.
- Frontend responsive layout shall render flawlessly on mobile, tablet, and desktop viewports.

3.7 DESIGN CONSTRAINTS
- Strict adherence to the no-bold text formatting rule across all documentation and presentation files.
- MongoDB document size constraint: All documents must remain well below the 16 MB BSON limit through discrete daily logging patterns rather than unbounded arrays.
- Stateless REST architecture: No server-side session state stored in memory.

3.9 OTHER REQUIREMENTS
- Internationalization readiness: All timestamps stored in UTC ISO 8601 format and converted to user local timezone on client render.
- Idempotent database seeding: Seeding scripts must be capable of repeated execution without generating duplicate records.

================================================================================
4. ANALYSIS MODELS
================================================================================

4.1 USE CASE MODEL
The FitPulse platform models the following primary use cases:
- UC-01: User Registration and Profile Provisioning
- UC-02: User Authentication and Session Token Validation
- UC-03: Log Daily Physical Activity and Hourly Steps
- UC-04: Search Food Database and Log Meal Items
- UC-05: Record Workout Session and Calculate Volume Load
- UC-06: Log Sleep Metrics and Analyze Overnight Stages
- UC-07: Increment Daily Hydration Intake
- UC-08: Log Anthropometric Body Measurements
- UC-09: View Longitudinal Analytics and MongoDB Aggregation Pipelines
- UC-10: Participate in Anonymized Community Leaderboard

4.2 DATA FLOW MODEL
The data flow model decomposes the system across three levels:

4.2.1 CONTEXT DIAGRAM (DFD LEVEL 0)
The Context Diagram establishes the boundary between external entities (User, Fitness Wearable, System Administrator) and the FitPulse Primary Process 0.0. User delivers authentication credentials, biometric stats, and daily logs, receiving dashboards, analytics, and leaderboard metrics.
Diagram reference: fitpulse/docs/images/dfd_level_0.png

4.2.2 SYSTEM DECOMPOSITION DIAGRAM (DFD LEVEL 1)
Decomposes FitPulse into 7 interconnected processes:
- Process 1.0: Authentication and Authorization Management (Data store D1: Users)
- Process 2.0: Activity and Movement Ingestion (Data store D2: ActivityLogs)
- Process 3.0: Nutrition and Meal Logging (Data stores D3: FoodItems, D4: MealLogs)
- Process 4.0: MongoDB Analytics and Aggregation Engine (Queries D2, D4, D5, D6, D7)
- Process 5.0: Workout and Resistance Logging (Data store D5: WorkoutLogs)
- Process 6.0: Sleep and Recovery Monitoring (Data store D6: SleepLogs)
- Process 7.0: Hydration and Fluid Balance (Data store D7: WaterLogs)
Diagram reference: fitpulse/docs/images/dfd_level_1.png

4.2.3 PROCESS 4.0 MONGODB AGGREGATION ENGINE (DFD LEVEL 2)
Detailed decomposition of Process 4.0 illustrating four sub-processes:
- Sub-process 4.1: Calorie Balance Correlator ($match, $lookup, $unwind, $project across ActivityLogs, MealLogs, WorkoutLogs)
- Sub-process 4.2: Macronutrient Breakdown Aggregator ($unwind, $group, $project on MealLogs)
- Sub-process 4.3: Workout Volume and Tonnage Calculator ($unwind, $multiply, $group on WorkoutLogs)
- Sub-process 4.4: Composite Lifestyle Consistency Engine ($facet parallel execution computing 5 weighted pillar scores)
Diagram reference: fitpulse/docs/images/dfd_level_2.png

4.3 STATE TRANSITION MODEL
User session transitions: Unauthenticated -> Authenticating -> Authenticated -> Token Expired -> Unauthenticated.
Goal progression transitions: Created -> In_Progress -> Achieved or Abandoned.

4.4 ENTITY RELATIONSHIP AND DOCUMENT MODELING
The data model uses 10 Mongoose collections. Bounded daily collections (ActivityLog, MealLog, SleepLog, WaterLog, BodyMeasurement) reference the User collection via ObjectId. Food items are embedded as snapshots within MealLog while referencing FoodItem master catalog. Exercises and sets are embedded directly inside WorkoutLog.

================================================================================
A. APPENDICES
================================================================================

A.1 MONGODB COLLECTION SCHEMAS AND INDEXING SPECIFICATIONS
Full collection schemas and compound indexes:
1. users: { email (unique), passwordHash, name, profile: { age, gender, heightCm, weightKg, activityLevel, goal } }
   Index: { email: 1 } (unique)
2. activitylogs: { userId (ObjectId), date (Date), steps, distanceKm, caloriesBurned, activeMinutes, hourlySteps: [{ hour, steps }] }
   Index: { userId: 1, date: -1 } (unique)
3. fooditems: { name, servingSize, calories, protein, carbs, fat, fiber, isCustom, createdBy }
   Index: { name: 'text' }, { createdBy: 1 } (sparse)
4. meallogs: { userId, date, mealType, items: [{ foodItemId, foodName, quantity, unit, calories, protein, carbs, fat }], totalCalories, totalProtein, totalCarbs, totalFat }
   Index: { userId: 1, date: -1 }
5. workoutlogs: { userId, title, date, durationMinutes, exercises: [{ name, category, sets: [{ setNumber, weightKg, reps, rpe }] }], totalVolumeKg }
   Index: { userId: 1, date: -1 }
6. sleeplogs: { userId, date, bedtime, wakeTime, durationMinutes, qualityRating, stages: { deepMinutes, remMinutes, lightMinutes, awakeMinutes } }
   Index: { userId: 1, date: -1 } (unique)
7. waterlogs: { userId, date, totalMl, entries: [{ timestamp, amountMl }] }
   Index: { userId: 1, date: -1 } (unique)
8. bodymeasurements: { userId, date, weightKg, bodyFatPercentage, circumferences: { chestCm, waistCm, hipsCm, thighsCm, bicepsCm }, bmi }
   Index: { userId: 1, date: -1 }
9. goals: { userId, category, targetValue, currentProgress, unit, period, status, startDate, targetDate }
   Index: { userId: 1, category: 1, status: 1 }
10. workouttemplates: { userId, name, description, exercises: [{ name, category, defaultSets: [{ setNumber, reps, targetRpe }] }] }
    Index: { userId: 1 }

A.2 STARTER FOOD CATALOG AND REGIONAL NUTRITION TABLE
The database is pre-seeded with 45+ comprehensive food items including regional staples:
- Roti (Whole Wheat Chapati): 1 piece (40g) | 104 kcal | 3.1g Protein | 20.4g Carbs | 0.8g Fat | 2.8g Fiber
- Dal Tadka (Yellow Lentils): 1 bowl (150g) | 165 kcal | 9.2g Protein | 22.4g Carbs | 4.8g Fat | 5.2g Fiber
- Paneer (Cottage Cheese): 100g | 265 kcal | 18.3g Protein | 3.2g Carbs | 20.8g Fat | 0.0g Fiber
- Steamed Basmati Rice: 1 cup (150g) | 195 kcal | 4.1g Protein | 43.2g Carbs | 0.6g Fat | 1.0g Fiber
- Chole Masala (Chickpea Curry): 1 bowl (150g) | 220 kcal | 8.5g Protein | 29.0g Carbs | 8.0g Fat | 6.5g Fiber
- Rajma Masala (Kidney Beans): 1 bowl (150g) | 210 kcal | 9.0g Protein | 28.5g Carbs | 7.2g Fat | 6.0g Fiber
- Chicken Curry (Home Style): 1 bowl (150g) | 245 kcal | 24.5g Protein | 4.2g Carbs | 14.5g Fat | 1.2g Fiber
- Boiled Egg: 1 large (50g) | 78 kcal | 6.3g Protein | 0.6g Carbs | 5.3g Fat | 0.0g Fiber

A.3 PHYSICAL ACTIVITY MET AND BIOMETRIC FORMULAS
- Mifflin-St Jeor BMR Equation:
  Men: BMR = (10 * weight in kg) + (6.25 * height in cm) - (5 * age in years) + 5
  Women: BMR = (10 * weight in kg) + (6.25 * height in cm) - (5 * age in years) - 161
- Exercise Energy Expenditure:
  Calories Burned = (MET * 3.5 * weight in kg / 200) * duration in minutes
- Walking Stride Length Formula:
  Stride Length in Meters = height in cm * 0.415 / 100
  Distance in Km = (Steps * Stride Length) / 1000

A.4 DEMONSTRATION SCRIPT AND DEMO CREDENTIALS
To conduct a live demonstration of FitPulse for the MongoDB evaluation committee:
1. Ensure MongoDB 8.x is running on localhost:27017.
2. Start the backend: cd fitpulse/backend && npm run dev
3. Start the frontend: cd fitpulse/frontend && npm run dev
4. Open the browser to http://localhost:5173.
5. On the login screen, click 'Quick Fill Demo Account' or enter:
   Email: demo@fitpulse.app
   Password: Password123!
6. Navigate to the 'Analytics' tab to view real-time MongoDB aggregation pipelines and raw pipeline code inspector.
7. Open the interactive presentation: fitpulse/docs/FitPulse_MongoDB_Presentation.html
8. Open the Microsoft PowerPoint presentation: fitpulse/docs/FitPulse_MongoDB_Presentation.pptx
