import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BodyMeasurement } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Scale,
  Plus,
  Trash2,
  Calendar,
  TrendingDown,
  TrendingUp,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const Measurements: React.FC = () => {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [totalWeightChange, setTotalWeightChange] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightKg, setWeightKg] = useState<number>(75.0);
  const [waistCm, setWaistCm] = useState<number>(83.0);
  const [hipCm, setHipCm] = useState<number>(98.0);
  const [chestCm, setChestCm] = useState<number>(102.0);
  const [armCm, setArmCm] = useState<number>(37.5);
  const [thighCm, setThighCm] = useState<number>(56.5);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMeasurements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/measurements');
      if (res.data?.success) {
        setMeasurements(res.data.data);
        setTotalWeightChange(res.data.totalWeightChange || 0);
      }
    } catch (err) {
      console.error('Failed to fetch measurements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/measurements', {
        date: formDate,
        weightKg: Number(weightKg),
        waistCm: waistCm ? Number(waistCm) : undefined,
        hipCm: hipCm ? Number(hipCm) : undefined,
        chestCm: chestCm ? Number(chestCm) : undefined,
        armCm: armCm ? Number(armCm) : undefined,
        thighCm: thighCm ? Number(thighCm) : undefined,
        notes,
      });
      setIsModalOpen(false);
      await fetchMeasurements();
    } catch (err) {
      console.error('Failed to save measurement:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this measurement entry?')) return;
    try {
      await api.delete(`/measurements/${id}`);
      await fetchMeasurements();
    } catch (err) {
      console.error('Failed to delete measurement:', err);
    }
  };

  const chartData = [...measurements].reverse().map((m) => ({
    date: m.date.slice(5),
    weight: m.weightKg,
    waist: m.waistCm,
  }));

  const latest = measurements[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Body Measurements & Composition
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track weight deltas, waist circumference, and anthropometric progression
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <Plus size={18} />
          Record Measurement
        </Button>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-lime-accent/15 border border-lime-accent/30 flex items-center justify-center text-lime-accent shrink-0">
            <Scale size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Current Weight</span>
            <div className="text-2xl font-extrabold text-white">
              {latest ? `${latest.weightKg} kg` : '—'}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-accent/15 border border-violet-accent/30 flex items-center justify-center text-violet-300 shrink-0">
            {totalWeightChange <= 0 ? <TrendingDown size={24} /> : <TrendingUp size={24} />}
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Net Progression</span>
            <div className="text-2xl font-extrabold text-white">
              {totalWeightChange > 0 ? `+${totalWeightChange}` : totalWeightChange} kg
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Waist Circumference</span>
            <div className="text-2xl font-extrabold text-white">
              {latest?.waistCm ? `${latest.waistCm} cm` : '—'}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Last Recorded</span>
            <div className="text-lg font-bold text-white">
              {latest ? latest.date : 'None'}
            </div>
          </div>
        </Card>
      </div>

      {/* Weight Progress Line Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale size={18} className="text-lime-accent" />
              Weight Progression (kg)
            </h3>
            <p className="text-xs text-gray-400">Historical trend from MongoDB `body_measurements`</p>
          </div>
          <Badge variant="lime">Metric (kg)</Badge>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#151B2B',
                  borderColor: '#273349',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${val} kg`, 'Body Weight']}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#A3E635"
                strokeWidth={3}
                dot={{ r: 5, fill: '#A3E635' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* History Table */}
      <Card className="overflow-hidden p-0">
        <div className="p-5 border-b border-[#273349] flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Measurement Logs</h3>
          <span className="text-xs text-gray-400">{measurements.length} check-ins</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#151B2B] text-xs text-gray-400 uppercase tracking-wider border-b border-[#273349]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Date</th>
                <th className="px-6 py-3.5 font-semibold">Weight</th>
                <th className="px-6 py-3.5 font-semibold">Waist</th>
                <th className="px-6 py-3.5 font-semibold">Chest / Hip</th>
                <th className="px-6 py-3.5 font-semibold">Arm / Thigh</th>
                <th className="px-6 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273349]">
              {measurements.map((m) => (
                <tr key={m._id} className="hover:bg-[#151B2B]/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-white">{m.date}</td>
                  <td className="px-6 py-4 font-bold text-lime-accent">{m.weightKg} kg</td>
                  <td className="px-6 py-4 text-gray-300">{m.waistCm ? `${m.waistCm} cm` : '—'}</td>
                  <td className="px-6 py-4 text-gray-300">
                    {m.chestCm || '—'} / {m.hipCm || '—'} cm
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {m.armCm || '—'} / {m.thighCm || '—'} cm
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="text-xs text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Body Measurements"
      >
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Body Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Waist (cm)
              </label>
              <input
                type="number"
                step="0.5"
                value={waistCm}
                onChange={(e) => setWaistCm(Number(e.target.value))}
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Hip (cm)
              </label>
              <input
                type="number"
                step="0.5"
                value={hipCm}
                onChange={(e) => setHipCm(Number(e.target.value))}
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Chest (cm)
              </label>
              <input
                type="number"
                step="0.5"
                value={chestCm}
                onChange={(e) => setChestCm(Number(e.target.value))}
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Arm (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={armCm}
                onChange={(e) => setArmCm(Number(e.target.value))}
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Thigh (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={thighCm}
                onChange={(e) => setThighCm(Number(e.target.value))}
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Fasted morning check-in, feeling leaner"
              rows={2}
              className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Save Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
