import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  BarChart3,
  Database,
  Flame,
  Award,
  Footprints,
  Dumbbell,
  Moon,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';

export const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pipelines' | 'leaderboard'>('overview');
  const [stepsData, setStepsData] = useState<any>(null);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [workoutData, setWorkoutData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [sRes, nRes, wRes, mRes, lRes] = await Promise.all([
        api.get('/analytics/steps'),
        api.get('/analytics/nutrition'),
        api.get('/analytics/workouts'),
        api.get('/analytics/progress'),
        api.get('/analytics/leaderboard'),
      ]);

      if (sRes.data?.success) setStepsData(sRes.data.data);
      if (nRes.data?.success) setNutritionData(nRes.data.data);
      if (wRes.data?.success) setWorkoutData(wRes.data.data);
      if (mRes.data?.success) setMonthlyData(mRes.data.data);
      if (lRes.data?.success) setLeaderboard(lRes.data.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Advanced Analytics & Aggregation Engine
            <Badge variant="lime">Academic Showcase</Badge>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Zero in-memory JavaScript filtering: queries powered directly by MongoDB Aggregation Pipelines
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#151B2B] border border-[#273349] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-lime-accent text-dark-bg shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Biometric Insights
          </button>
          <button
            onClick={() => setActiveTab('pipelines')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pipelines'
                ? 'bg-lime-accent text-dark-bg shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Aggregation Pipelines
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-lime-accent text-dark-bg shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Activity Leaderboard
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Workout Volume & Category Aggregation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Dumbbell size={18} className="text-lime-accent" />
                    Top Exercise Training Volume (kg)
                  </h3>
                  <p className="text-xs text-gray-400">
                    MongoDB $unwind exercises.sets → $multiply(reps, weight) → $group
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {workoutData?.volumeStats?.map((v: any) => (
                  <div key={v.exerciseName} className="p-3 bg-[#151B2B] rounded-xl border border-[#273349] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{v.exerciseName}</div>
                      <span className="text-xs text-gray-400">
                        {v.totalSets} sets logged • Max Lift: {v.maxWeightLifted} kg
                      </span>
                    </div>
                    <Badge variant="lime">
                      {v.totalVolumeKg.toLocaleString()} kg volume
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <TrendingUp size={18} className="text-violet-400" />
                    Workout Category Distribution
                  </h3>
                  <p className="text-xs text-gray-400">
                    Grouped sessions and duration by workoutType
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {workoutData?.categoryStats?.map((c: any) => (
                  <div key={c.workoutType} className="p-3 bg-[#151B2B] rounded-xl border border-[#273349] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm capitalize">
                        {c.workoutType.replace('_', ' ')}
                      </div>
                      <span className="text-xs text-gray-400">
                        {c.sessionCount} sessions • Total: {c.totalDurationMinutes} mins
                      </span>
                    </div>
                    <Badge variant="violet">
                      Avg: {c.avgDurationMinutes} mins
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Monthly Historical Aggregation */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Database size={18} className="text-sky-400" />
                  Monthly Aggregated Trends (Pipeline 6)
                </h3>
                <p className="text-xs text-gray-400">
                  Aggregated across steps, workouts, and weight progressions by calendar month
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#151B2B] rounded-xl border border-[#273349]">
                <span className="text-xs text-gray-400 font-semibold uppercase">Monthly Steps</span>
                {monthlyData?.monthlySteps?.map((ms: any) => (
                  <div key={ms._id} className="mt-2 flex justify-between items-center text-sm">
                    <span className="font-mono text-gray-300">{ms._id}</span>
                    <span className="font-bold text-white">{ms.totalSteps.toLocaleString()} steps</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[#151B2B] rounded-xl border border-[#273349]">
                <span className="text-xs text-gray-400 font-semibold uppercase">Monthly Workouts</span>
                {monthlyData?.monthlyWorkouts?.map((mw: any) => (
                  <div key={mw._id} className="mt-2 flex justify-between items-center text-sm">
                    <span className="font-mono text-gray-300">{mw._id}</span>
                    <span className="font-bold text-white">{mw.workoutCount} sessions ({mw.totalMinutes}m)</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[#151B2B] rounded-xl border border-[#273349]">
                <span className="text-xs text-gray-400 font-semibold uppercase">Monthly Weight Delta</span>
                {monthlyData?.monthlyWeight?.map((mw: any) => (
                  <div key={mw._id} className="mt-2 flex justify-between items-center text-sm">
                    <span className="font-mono text-gray-300">{mw._id}</span>
                    <span className="font-bold text-white">
                      {mw.weightChange > 0 ? `+${mw.weightChange}` : mw.weightChange} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'pipelines' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
              <Cpu size={20} className="text-lime-accent" />
              University MongoDB Pipeline Architecture
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              FitPulse uses real MongoDB multi-stage aggregation pipelines for high-performance server-side data reduction.
            </p>

            <div className="space-y-6">
              {/* Pipeline 1 */}
              <div className="p-4 bg-[#151B2B] rounded-xl border border-[#273349]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">Pipeline 1: Weekly Step Analysis</span>
                  <Badge variant="lime">ActivityLog.aggregate()</Badge>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Stages: <code>$match</code> → <code>$sort</code> → <code>$group</code> (_id: '$date', steps: $sum) → <code>$project</code> ($round)
                </p>
                <pre className="bg-[#0B0F19] p-3 rounded-lg text-xs font-mono text-lime-accent/90 overflow-x-auto">
{`[
  { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
  { $group: { _id: '$date', totalSteps: { $sum: '$steps' }, distanceKm: { $sum: '$distanceKm' } } },
  { $project: { date: '$_id', steps: '$totalSteps', distanceKm: { $round: ['$distanceKm', 2] } } },
  { $sort: { date: 1 } }
]`}
                </pre>
              </div>

              {/* Pipeline 2 */}
              <div className="p-4 bg-[#151B2B] rounded-xl border border-[#273349]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">Pipeline 2: Nutrition & Macro Analysis</span>
                  <Badge variant="violet">MealLog.aggregate()</Badge>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Stages: <code>$match</code> → <code>$unwind</code> ($items) → <code>$group</code> ($sum calories, protein, carbs, fat) → <code>$facet</code>
                </p>
                <pre className="bg-[#0B0F19] p-3 rounded-lg text-xs font-mono text-violet-300 overflow-x-auto">
{`[
  { $match: { userId, date: targetDate } },
  { $group: {
      _id: '$mealType',
      totalCalories: { $sum: '$totalCalories' },
      totalProtein: { $sum: '$totalProtein' }
    }
  }
]`}
                </pre>
              </div>

              {/* Pipeline 5 */}
              <div className="p-4 bg-[#151B2B] rounded-xl border border-[#273349]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">Pipeline 5: Calorie Balance Analysis ($lookup Join)</span>
                  <Badge variant="warning">Cross-Collection Join</Badge>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Joins <code>activity_logs</code>, <code>meal_logs</code>, and <code>workout_logs</code> by composite key (userId + date)
                </p>
                <pre className="bg-[#0B0F19] p-3 rounded-lg text-xs font-mono text-amber-300 overflow-x-auto">
{`[
  { $match: { userId } },
  { $lookup: { from: 'meallogs', let: { d: '$date', u: '$userId' }, pipeline: [...], as: 'mealData' } },
  { $lookup: { from: 'workoutlogs', let: { d: '$date', u: '$userId' }, pipeline: [...], as: 'workoutData' } },
  { $project: {
      netBalance: { $subtract: ['$caloriesConsumed', { $add: ['$walkingBurned', '$workoutBurned'] }] }
    }
  }
]`}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <Card className="overflow-hidden p-0">
          <div className="p-5 border-b border-[#273349] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award size={18} className="text-lime-accent" />
                Community Step Consistency Leaderboard
              </h3>
              <p className="text-xs text-gray-400">
                Generated via Pipeline 7: $group by userId → $lookup users → privacy-preserving anonymization
              </p>
            </div>
            <Badge variant="lime">Top 10 Active</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#151B2B] text-xs text-gray-400 uppercase tracking-wider border-b border-[#273349]">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Rank</th>
                  <th className="px-6 py-3.5 font-semibold">User</th>
                  <th className="px-6 py-3.5 font-semibold">7-Day Total Steps</th>
                  <th className="px-6 py-3.5 font-semibold">Daily Average</th>
                  <th className="px-6 py-3.5 font-semibold">Active Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#273349]">
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No leaderboard data available yet.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((item, index) => (
                    <tr key={item._id} className="hover:bg-[#151B2B]/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-lime-accent">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {item.displayName || 'Anonymous Athlete'}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        {item.totalSteps.toLocaleString()} steps
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {item.avgDailySteps.toLocaleString()} steps/day
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="lime">{item.activeDays} / 7 days</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
