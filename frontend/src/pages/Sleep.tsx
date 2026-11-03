import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { SleepLog } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Moon,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Star,
  CheckCircle,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const Sleep: React.FC = () => {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const [formStart, setFormStart] = useState(`${yesterday.toISOString().split('T')[0]}T23:00`);
  const [formEnd, setFormEnd] = useState(`${now.toISOString().split('T')[0]}T07:00`);
  const [formQuality, setFormQuality] = useState(4);
  const [formNotes, setFormNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSleepData = async () => {
    setLoading(true);
    try {
      const [logsRes, analyticsRes] = await Promise.all([
        api.get('/sleep?limit=30'),
        api.get('/analytics/sleep'),
      ]);
      if (logsRes.data?.success) setLogs(logsRes.data.data);
      if (analyticsRes.data?.success) setStats(analyticsRes.data.data?.stats);
    } catch (err) {
      console.error('Failed to fetch sleep records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSleepData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/sleep', {
        sleepStart: new Date(formStart).toISOString(),
        sleepEnd: new Date(formEnd).toISOString(),
        quality: Number(formQuality),
        notes: formNotes,
      });
      setIsModalOpen(false);
      await fetchSleepData();
    } catch (err) {
      console.error('Failed to log sleep:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this sleep entry?')) return;
    try {
      await api.delete(`/sleep/${id}`);
      await fetchSleepData();
    } catch (err) {
      console.error('Failed to delete sleep entry:', err);
    }
  };

  const chartData = [...logs].reverse().map((l) => ({
    date: l.sleepStart.slice(5, 10),
    hours: Number((l.durationMinutes / 60).toFixed(1)),
    quality: l.quality,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Sleep Monitoring & Recovery
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Midnight-crossing duration calculation and sleep schedule consistency
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <Plus size={18} />
          Log Sleep Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-accent/15 border border-violet-accent/30 flex items-center justify-center text-violet-300 shrink-0">
            <Moon size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Avg Duration</span>
            <div className="text-2xl font-extrabold text-white">
              {stats?.avgDurationHours || 0} hrs
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Star size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Avg Quality Rating</span>
            <div className="text-2xl font-extrabold text-white">
              {stats?.avgQuality || 0} / 5
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Consistency Score</span>
            <div className="text-2xl font-extrabold text-white">
              {stats?.sleepConsistencyScore || 0}%
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Recorded Nights</span>
            <div className="text-2xl font-extrabold text-white">
              {stats?.totalEntries || logs.length}
            </div>
          </div>
        </Card>
      </div>

      {/* Sleep Trend Chart */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Moon size={18} className="text-violet-400" />
              Sleep Duration Trend (Hours per Night)
            </h3>
            <p className="text-xs text-gray-400">Target baseline: 8.0 hours</p>
          </div>
          <Badge variant="violet">Last 30 Nights</Badge>
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
                formatter={(val: any) => [`${val} hrs`, 'Duration']}
              />
              <Bar dataKey="hours" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Sleep Log Table */}
      <Card className="overflow-hidden p-0">
        <div className="p-5 border-b border-[#273349] flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Recorded Sleep Entries</h3>
          <span className="text-xs text-gray-400">MongoDB `sleep_logs` with ISO timestamps</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#151B2B] text-xs text-gray-400 uppercase tracking-wider border-b border-[#273349]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Sleep Window</th>
                <th className="px-6 py-3.5 font-semibold">Duration</th>
                <th className="px-6 py-3.5 font-semibold">Quality</th>
                <th className="px-6 py-3.5 font-semibold">Notes</th>
                <th className="px-6 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273349]">
              {logs.map((l) => {
                const startStr = new Date(l.sleepStart).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const endStr = new Date(l.sleepEnd).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const startDateStr = new Date(l.sleepStart).toISOString().slice(5, 10);

                return (
                  <tr key={l._id} className="hover:bg-[#151B2B]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">
                        {startDateStr} ({startStr} → {endStr})
                      </div>
                      <span className="text-[11px] text-gray-400">Crossing midnight handled</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-violet-300">
                      {(l.durationMinutes / 60).toFixed(1)} hrs ({l.durationMinutes}m)
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < l.quality ? 'fill-amber-400' : 'text-gray-600'}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">{l.notes || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(l._id)}
                        className="text-xs text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Sleep Entry"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Sleep Start (Bedtime)
            </label>
            <input
              type="datetime-local"
              required
              value={formStart}
              onChange={(e) => setFormStart(e.target.value)}
              className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Sleep End (Wake-up)
            </label>
            <input
              type="datetime-local"
              required
              value={formEnd}
              onChange={(e) => setFormEnd(e.target.value)}
              className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Self-Reported Quality (1 to 5 Stars)
            </label>
            <div className="flex gap-3 pt-1">
              {[1, 2, 3, 4, 5].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setFormQuality(q)}
                  className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                    formQuality === q
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm'
                      : 'border-[#273349] text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Star size={18} className={formQuality >= q ? 'fill-amber-400' : ''} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Sleep Notes
            </label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Slept deeply, no wakeups, feeling recovered"
              rows={2}
              className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
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
