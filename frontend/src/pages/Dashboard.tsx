import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DashboardOverview } from '../types';
import { Card } from '../components/ui/Card';
import { CircularProgress } from '../components/ui/CircularProgress';
import { Badge } from '../components/ui/Badge';
import {
  Footprints,
  Flame,
  Droplets,
  Moon,
  Dumbbell,
  Apple,
  TrendingUp,
  Calendar,
  Award,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const fetchDashboard = async (date: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/dashboard?date=${date}`);
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(selectedDate);
  }, [selectedDate]);

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-800 rounded-xl w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-gray-800/50 rounded-2xl border border-gray-700/50" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;
  const visualizations = data?.visualizations;
  const consistency = visualizations?.consistencyScore;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Personal Health Intelligence
            <Badge variant="lime" className="hidden sm:inline-flex">Live MongoDB</Badge>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time biometric analytics, calorie balance, and habit consistency
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-[#151B2B] border border-[#273349] px-3.5 py-1.5 rounded-xl">
          <Calendar size={16} className="text-lime-accent" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-sm text-white focus:outline-none font-medium cursor-pointer"
          />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Daily Steps */}
        <Card glow="lime" className="relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-lime-accent text-xs font-semibold uppercase tracking-wider mb-1">
                <Footprints size={16} />
                <span>Daily Steps</span>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {kpis?.steps.current.toLocaleString() || 0}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Target: {kpis?.steps.target.toLocaleString() || 10000} steps
              </div>
            </div>
            <CircularProgress
              percentage={kpis?.steps.percentage || 0}
              size={76}
              strokeWidth={7}
              color="#A3E635"
              subtext="done"
            />
          </div>
          <div className="mt-4 pt-3 border-t border-[#273349]/60 flex items-center justify-between text-xs text-gray-400">
            <span>Est. Distance:</span>
            <span className="font-semibold text-white">{kpis?.steps.distanceKm || 0} km</span>
          </div>
        </Card>

        {/* Card 2: Calories */}
        <Card glow="violet" className="relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Flame size={16} />
                <span>Calorie Balance</span>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {kpis?.calories.consumed || 0}{' '}
                <span className="text-xs font-normal text-gray-400">kcal intake</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Burned: ~{kpis?.calories.burned || 0} kcal (walking + exercise)
              </div>
            </div>
            <div className="text-right">
              <Badge
                variant={
                  (kpis?.calories?.balance || 0) <= 0
                    ? 'success'
                    : 'warning'
                }
              >
                Net: {(kpis?.calories?.balance || 0) > 0 ? `+${kpis?.calories?.balance}` : (kpis?.calories?.balance || 0)}
              </Badge>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#273349]/60">
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-violet-accent h-2 transition-all"
                style={{
                  width: `${Math.min(100, ((kpis?.calories.consumed || 0) / (kpis?.calories.target || 2200)) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 mt-1">
              <span>Goal: {kpis?.calories.target} kcal</span>
              <span>{Math.round(((kpis?.calories.consumed || 0) / (kpis?.calories.target || 2200)) * 100)}%</span>
            </div>
          </div>
        </Card>

        {/* Card 3: Water */}
        <Card className="relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Droplets size={16} />
                <span>Hydration</span>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {kpis?.water.consumedMl || 0}{' '}
                <span className="text-xs font-normal text-gray-400">ml</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Daily Goal: {kpis?.water.targetMl || 2500} ml
              </div>
            </div>
            <CircularProgress
              percentage={kpis?.water.percentage || 0}
              size={76}
              strokeWidth={7}
              color="#38BDF8"
              subtext="drunk"
            />
          </div>
          <div className="mt-4 pt-3 border-t border-[#273349]/60 flex items-center justify-between text-xs text-gray-400">
            <span>Remaining today:</span>
            <span className="font-semibold text-white">
              {Math.max(0, (kpis?.water.targetMl || 2500) - (kpis?.water.consumedMl || 0))} ml
            </span>
          </div>
        </Card>

        {/* Card 4: Sleep */}
        <Card className="relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Moon size={16} />
                <span>Sleep Duration</span>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {kpis?.sleep.lastDurationHours || 0}{' '}
                <span className="text-xs font-normal text-gray-400">hrs</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Target: {Number(((kpis?.sleep.targetMinutes || 480) / 60).toFixed(1))} hrs
              </div>
            </div>
            <div className="flex flex-col items-end">
              <Badge variant="violet">Quality: {kpis?.sleep.quality || 0}/5</Badge>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#273349]/60 flex items-center justify-between text-xs text-gray-400">
            <span>Midnight Cross:</span>
            <span className="text-emerald-400 font-medium">Verified Timestamp</span>
          </div>
        </Card>

        {/* Card 5: Workouts */}
        <Card className="relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Dumbbell size={16} />
                <span>Workouts (7d)</span>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {kpis?.workout.completedThisWeek || 0}{' '}
                <span className="text-xs font-normal text-gray-400">sessions</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Total duration: {kpis?.workout.totalDurationMinutes || 0} mins
              </div>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#273349]/60 flex items-center justify-between text-xs text-gray-400">
            <span>Weekly Target:</span>
            <span className="font-semibold text-white">4 Sessions</span>
          </div>
        </Card>

        {/* Card 6: Nutrition */}
        <Card className="relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Apple size={16} />
                <span>Protein Intake</span>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {kpis?.nutrition.protein || 0}{' '}
                <span className="text-xs font-normal text-gray-400">g</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Target: {kpis?.nutrition.proteinGoal || 120} g
              </div>
            </div>
            <div className="text-right text-xs space-y-1">
              <div className="text-gray-300">Carbs: {kpis?.nutrition.carbs}g</div>
              <div className="text-gray-400">Fats: {kpis?.nutrition.fat}g</div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#273349]/60">
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-2 transition-all"
                style={{
                  width: `${Math.min(100, ((kpis?.nutrition.protein || 0) / (kpis?.nutrition.proteinGoal || 120)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Step Volume */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Footprints size={18} className="text-lime-accent" />
                Weekly Step Cadence
              </h3>
              <p className="text-xs text-gray-400">Aggregated with MongoDB $group & calendar day sorting</p>
            </div>
            <Badge variant="lime">Last 7 Days</Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visualizations?.weeklySteps || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151B2B',
                    borderColor: '#273349',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value} steps`, 'Steps']}
                />
                <Bar dataKey="steps" fill="#A3E635" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Macronutrient Distribution */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Apple size={18} className="text-violet-400" />
              Macro Distribution
            </h3>
            <p className="text-xs text-gray-400 mb-4">Calculated from item-level logs</p>
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visualizations?.macroDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {visualizations?.macroDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151B2B',
                      borderColor: '#273349',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: any, item: any) => [
                      `${item.payload.grams}g (${val} kcal)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#273349] text-center">
            {visualizations?.macroDistribution.map((m) => (
              <div key={m.name} className="flex flex-col">
                <span className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.name}
                </span>
                <span className="text-sm font-bold text-white">{m.grams}g</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Second Charts Row: Calorie Balance vs Burn & Lifestyle Consistency Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calorie Intake vs Burn Comparison */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame size={18} className="text-amber-400" />
                Caloric Intake vs Total Burned
              </h3>
              <p className="text-xs text-gray-400">Cross-collection join via MongoDB $lookup pipeline</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-accent" /> Intake
              </span>
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-accent" /> Burned
              </span>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visualizations?.calorieBalance || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="intakeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="burnedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A3E635" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#A3E635" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(val) => val.slice(5)} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151B2B',
                    borderColor: '#273349',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="caloriesConsumed" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#intakeGrad)" />
                <Area type="monotone" dataKey="totalBurned" stroke="#A3E635" strokeWidth={2} fillOpacity={1} fill="url(#burnedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Composite Lifestyle Consistency Score Card */}
        <Card className="flex flex-col justify-between border-lime-accent/20">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-lime-accent uppercase tracking-wider flex items-center gap-1.5">
                <Award size={16} />
                Consistency Score
              </span>
              <Badge variant="lime">{consistency?.totalScore || 0} / 100</Badge>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Habit Adherence Index</h3>
            <p className="text-xs text-gray-400 mb-4">
              Transparent multi-metric composite tracking steps, workouts, sleep, and hydration.
            </p>

            {/* Breakdown bars */}
            <div className="space-y-2.5">
              {consistency && (
                <>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">Steps Adherence</span>
                      <span className="text-white font-semibold">
                        {consistency.breakdown.steps.score}/{consistency.breakdown.steps.max} pts
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-lime-accent h-1.5 rounded-full"
                        style={{ width: `${consistency.breakdown.steps.adherencePercentage}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">Workout Regularity</span>
                      <span className="text-white font-semibold">
                        {consistency.breakdown.workouts.score}/{consistency.breakdown.workouts.max} pts
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-amber-400 h-1.5 rounded-full"
                        style={{ width: `${consistency.breakdown.workouts.adherencePercentage}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">Sleep Adherence</span>
                      <span className="text-white font-semibold">
                        {consistency.breakdown.sleep.score}/{consistency.breakdown.sleep.max} pts
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-violet-400 h-1.5 rounded-full"
                        style={{ width: `${consistency.breakdown.sleep.adherencePercentage}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">Hydration Target</span>
                      <span className="text-white font-semibold">
                        {consistency.breakdown.hydration.score}/{consistency.breakdown.hydration.max} pts
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-sky-400 h-1.5 rounded-full"
                        style={{ width: `${consistency.breakdown.hydration.adherencePercentage}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#273349] flex items-center gap-2 text-[10px] text-gray-500">
            <ShieldCheck size={14} className="shrink-0 text-gray-400" />
            <span>Habit metric only; non-clinical score.</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
