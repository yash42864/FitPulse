import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { WaterLog } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CircularProgress } from '../components/ui/CircularProgress';
import {
  Droplets,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const Hydration: React.FC = () => {
  const [entries, setEntries] = useState<WaterLog[]>([]);
  const [totalToday, setTotalToday] = useState<number>(0);
  const [weeklyTrend, setWeeklyTrend] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [customAmount, setCustomAmount] = useState<number>(300);
  const [dailyGoal] = useState<number>(3000); // 3000 ml
  const [loading, setLoading] = useState(true);

  const fetchWaterData = async (date: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/water?date=${date}`);
      if (res.data?.success) {
        setEntries(res.data.entries || []);
        setTotalToday(res.data.totalTodayMl || 0);
        setWeeklyTrend(res.data.weeklyTrend || []);
      }
    } catch (err) {
      console.error('Failed to load hydration data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaterData(selectedDate);
  }, [selectedDate]);

  const handleAddWater = async (amount: number) => {
    try {
      await api.post('/water', {
        amountMl: amount,
        timestamp: `${selectedDate}T${new Date().toTimeString().split(' ')[0]}.000Z`,
      });
      await fetchWaterData(selectedDate);
    } catch (err) {
      console.error('Failed to log water:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/water/${id}`);
      await fetchWaterData(selectedDate);
    } catch (err) {
      console.error('Failed to delete water log:', err);
    }
  };

  const percentage = Math.min(100, Math.round((totalToday / dailyGoal) * 100));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Hydration & Water Intake
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track daily water consumption with one-tap quick-add and trend insights
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#151B2B] border border-[#273349] px-3.5 py-1.5 rounded-xl">
          <Calendar size={16} className="text-sky-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-sm text-white focus:outline-none font-medium cursor-pointer"
          />
        </div>
      </div>

      {/* Hero Progress Card & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col sm:flex-row items-center justify-between p-8 gap-6 border-sky-500/20">
          <div className="space-y-3 text-center sm:text-left">
            <Badge variant="lime">Daily Target: {dailyGoal} ml</Badge>
            <h2 className="text-3xl font-extrabold text-white">
              {totalToday.toLocaleString()} <span className="text-lg font-normal text-gray-400">ml consumed</span>
            </h2>
            <p className="text-sm text-gray-400">
              {totalToday >= dailyGoal ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5 justify-center sm:justify-start">
                  <CheckCircle size={16} /> Daily hydration target achieved! Outstanding consistency.
                </span>
              ) : (
                <span>
                  {dailyGoal - totalToday} ml remaining to hit today's hydration target.
                </span>
              )}
            </p>

            {/* Quick Add Buttons */}
            <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddWater(100)}
                className="hover:border-sky-400 hover:text-sky-300"
              >
                +100 ml (Sip)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddWater(250)}
                className="hover:border-sky-400 hover:text-sky-300"
              >
                +250 ml (Glass)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddWater(500)}
                className="hover:border-sky-400 hover:text-sky-300 font-semibold"
              >
                +500 ml (Bottle)
              </Button>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center">
            <CircularProgress
              percentage={percentage}
              size={130}
              strokeWidth={12}
              color="#38BDF8"
              subtext="of goal"
            />
          </div>
        </Card>

        {/* Custom Water Input Card */}
        <Card className="flex flex-col justify-between p-6">
          <div>
            <h3 className="font-bold text-white text-base mb-1">Custom Volume</h3>
            <p className="text-xs text-gray-400 mb-4">
              Log an exact measurement from your sports shaker or hydration flask.
            </p>
            <div className="relative">
              <input
                type="number"
                step="50"
                min="10"
                max="5000"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="w-full bg-[#151B2B] border border-[#273349] rounded-xl px-4 py-3 text-lg font-bold text-white focus:border-sky-400 focus:outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                ml
              </span>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => handleAddWater(customAmount)}
            className="w-full mt-4 bg-sky-500 hover:bg-sky-400 text-black font-bold"
          >
            <Plus size={18} />
            Log Custom {customAmount} ml
          </Button>
        </Card>
      </div>

      {/* Weekly Hydration Bar Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Droplets size={18} className="text-sky-400" />
              Weekly Hydration Intake (ml)
            </h3>
            <p className="text-xs text-gray-400">Past 7 days aggregated from MongoDB `water_logs`</p>
          </div>
          <Badge variant="lime">Target: 3,000 ml</Badge>
        </div>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(v) => v.slice(5)} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#151B2B',
                  borderColor: '#273349',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${val.toLocaleString()} ml`, 'Intake']}
              />
              <Bar dataKey="totalMl" fill="#38BDF8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Intakes for Selected Day */}
      <Card className="overflow-hidden p-0">
        <div className="p-5 border-b border-[#273349] flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Intake Logs for {selectedDate}</h3>
          <span className="text-xs text-gray-400">{entries.length} entries recorded</span>
        </div>
        <div className="divide-y divide-[#273349]">
          {entries.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No water entries recorded for {selectedDate}. Use the quick-add buttons above!
            </div>
          ) : (
            entries.map((item) => (
              <div key={item._id} className="p-4 flex items-center justify-between hover:bg-[#151B2B]/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Droplets size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm">{item.amountMl} ml</span>
                    <span className="text-xs text-gray-500 ml-2 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="text-gray-500 hover:text-red-400 p-1 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
