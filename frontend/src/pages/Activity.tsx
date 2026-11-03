import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ActivityLog } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Footprints,
  Flame,
  Route,
  Zap,
  Plus,
  Trash2,
  Calendar,
  Info,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const Activity: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<ActivityLog | null>(null);

  // Form State
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formSteps, setFormSteps] = useState(10000);
  const [submitting, setSubmitting] = useState(false);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const res = await api.get('/activity?limit=30');
      if (res.data?.success) {
        setLogs(res.data.data);
        setStreak(res.data.currentStreak || 0);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/activity', {
        date: formDate,
        steps: Number(formSteps),
      });
      setIsModalOpen(false);
      setEditingLog(null);
      await fetchActivity();
    } catch (err) {
      console.error('Failed to save activity log:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this activity record?')) return;
    try {
      await api.delete(`/activity/${id}`);
      await fetchActivity();
    } catch (err) {
      console.error('Failed to delete activity:', err);
    }
  };

  const openNewEntry = () => {
    setEditingLog(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormSteps(10000);
    setIsModalOpen(true);
  };

  const openEditEntry = (log: ActivityLog) => {
    setEditingLog(log);
    setFormDate(log.date);
    setFormSteps(log.steps);
    setIsModalOpen(true);
  };

  // Reverse logs for chronological chart rendering
  const chartData = [...logs].reverse().map((l) => ({
    date: l.date.slice(5),
    steps: l.steps,
    distanceKm: l.distanceKm,
    calories: l.estimatedCaloriesBurned,
  }));

  const totalStepsInHistory = logs.reduce((acc, l) => acc + l.steps, 0);
  const totalKmInHistory = logs.reduce((acc, l) => acc + l.distanceKm, 0);
  const totalBurnedInHistory = logs.reduce((acc, l) => acc + l.estimatedCaloriesBurned, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Activity & Steps Tracking
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manual logging with automated stride estimation and caloric expenditure
          </p>
        </div>
        <Button onClick={openNewEntry} variant="primary">
          <Plus size={18} />
          Log Daily Steps
        </Button>
      </div>

      {/* Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-lime-accent/15 border border-lime-accent/30 flex items-center justify-center text-lime-accent shrink-0">
            <Zap size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Daily Streak</span>
            <div className="text-2xl font-extrabold text-white">{streak} Days</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-accent/15 border border-violet-accent/30 flex items-center justify-center text-violet-300 shrink-0">
            <Footprints size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Recorded Steps</span>
            <div className="text-2xl font-extrabold text-white">
              {totalStepsInHistory.toLocaleString()}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Route size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Total Distance</span>
            <div className="text-2xl font-extrabold text-white">
              {Number(totalKmInHistory.toFixed(1))} km
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Flame size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Est. Walk Calories</span>
            <div className="text-2xl font-extrabold text-white">
              {totalBurnedInHistory.toLocaleString()} kcal
            </div>
          </div>
        </Card>
      </div>

      {/* Step Trend Chart */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Footprints size={18} className="text-lime-accent" />
              Activity History (Steps per Day)
            </h3>
            <p className="text-xs text-gray-400">Trend over recorded days in MongoDB</p>
          </div>
          <Badge variant="lime">{chartData.length} Entries</Badge>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#151B2B',
                  borderColor: '#273349',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${val.toLocaleString()} steps`, 'Steps']}
              />
              <Bar dataKey="steps" fill="#A3E635" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* History Table */}
      <Card className="overflow-hidden p-0">
        <div className="p-5 border-b border-[#273349] flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Daily Activity Logs</h3>
          <span className="text-xs text-gray-400">Directly persisted in MongoDB `activity_logs`</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#151B2B] text-xs text-gray-400 uppercase tracking-wider border-b border-[#273349]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Date</th>
                <th className="px-6 py-3.5 font-semibold">Steps</th>
                <th className="px-6 py-3.5 font-semibold">Distance (km)</th>
                <th className="px-6 py-3.5 font-semibold">Est. Burned</th>
                <th className="px-6 py-3.5 font-semibold">Source</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273349]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                    No activity entries found. Click "Log Daily Steps" above to record your first day!
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#151B2B]/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-white">{log.date}</td>
                    <td className="px-6 py-4 font-bold text-lime-accent">
                      {log.steps.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{log.distanceKm} km</td>
                    <td className="px-6 py-4 text-gray-300">{log.estimatedCaloriesBurned} kcal</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-gray-800 text-gray-400">
                        {log.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditEntry(log)}
                        className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-800 hover:bg-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(log._id)}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal for Creating or Editing Step Record */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLog ? 'Edit Daily Activity Log' : 'Record Daily Steps'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full bg-[#0B0F19] border border-[#273349] focus:border-lime-accent rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Step Count
            </label>
            <input
              type="number"
              required
              min={0}
              max={200000}
              value={formSteps}
              onChange={(e) => setFormSteps(Number(e.target.value))}
              placeholder="e.g. 10000"
              className="w-full bg-[#0B0F19] border border-[#273349] focus:border-lime-accent rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="p-3 bg-[#0B0F19] rounded-xl border border-[#273349] text-xs text-gray-400 space-y-1">
            <div className="flex items-center gap-1.5 text-gray-300 font-semibold">
              <Info size={14} className="text-lime-accent" />
              Automated Biometric Calculations:
            </div>
            <div>Estimated Distance: ~{((formSteps * 0.000762)).toFixed(2)} km</div>
            <div>Estimated Walking Burn: ~{Math.round(formSteps * 0.045)} kcal</div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Save to Database
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
