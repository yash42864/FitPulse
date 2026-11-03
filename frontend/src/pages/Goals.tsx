import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Goal } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Footprints,
  Flame,
  Apple,
  Droplets,
  Moon,
  Dumbbell,
  Scale,
} from 'lucide-react';

export const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [goalType, setGoalType] = useState<any>('steps');
  const [targetValue, setTargetValue] = useState<number>(10000);
  const [unit, setUnit] = useState<string>('steps');
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/goals');
      if (res.data?.success) {
        setGoals(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleGoalTypeChange = (type: string) => {
    setGoalType(type);
    const unitMap: Record<string, { unit: string; defaultVal: number }> = {
      steps: { unit: 'steps', defaultVal: 10000 },
      calories: { unit: 'kcal', defaultVal: 2200 },
      protein: { unit: 'g', defaultVal: 130 },
      water: { unit: 'ml', defaultVal: 2500 },
      sleep: { unit: 'minutes', defaultVal: 480 },
      workouts: { unit: 'sessions/week', defaultVal: 4 },
      weight: { unit: 'kg', defaultVal: 72 },
    };
    if (unitMap[type]) {
      setUnit(unitMap[type].unit);
      setTargetValue(unitMap[type].defaultVal);
    }
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/goals', {
        goalType,
        targetValue: Number(targetValue),
        unit,
        isActive: true,
      });
      setIsModalOpen(false);
      await fetchGoals();
    } catch (err) {
      console.error('Failed to save goal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!window.confirm('Delete this fitness goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      await fetchGoals();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'steps':
        return <Footprints size={22} className="text-lime-accent" />;
      case 'calories':
        return <Flame size={22} className="text-violet-400" />;
      case 'protein':
        return <Apple size={22} className="text-emerald-400" />;
      case 'water':
        return <Droplets size={22} className="text-sky-400" />;
      case 'sleep':
        return <Moon size={22} className="text-indigo-400" />;
      case 'workouts':
        return <Dumbbell size={22} className="text-amber-400" />;
      case 'weight':
        return <Scale size={22} className="text-rose-400" />;
      default:
        return <Target size={22} className="text-lime-accent" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Personal Fitness Goals
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Maintain configurable targets across activity, hydration, macros, and sleep
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <Plus size={18} />
          Create New Target
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((g) => {
          const pct = g.percentage || 0;
          return (
            <Card key={g._id} className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#151B2B] border border-[#273349] flex items-center justify-center">
                      {getIcon(g.goalType)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white capitalize text-base">
                        {g.goalType.replace('_', ' ')} Target
                      </h3>
                      <span className="text-xs text-gray-400 font-mono">
                        Target: {g.targetValue.toLocaleString()} {g.unit}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteGoal(g._id)}
                    className="text-gray-500 hover:text-red-400 p-1 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Current Progress</span>
                    <span className="font-bold text-white">
                      {g.currentProgress?.toLocaleString() || 0} / {g.targetValue.toLocaleString()} {g.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-lime-accent h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#273349] flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1 font-semibold text-white">
                  {pct}% Completed
                </span>
                <Badge variant={pct >= 100 ? 'lime' : 'neutral'}>
                  {pct >= 100 ? 'Target Reached' : 'In Progress'}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Establish Fitness Target"
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Goal Type
            </label>
            <select
              value={goalType}
              onChange={(e) => handleGoalTypeChange(e.target.value)}
              className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none capitalize"
            >
              <option value="steps">Daily Steps</option>
              <option value="calories">Daily Calorie Intake</option>
              <option value="protein">Daily Protein Intake</option>
              <option value="water">Daily Hydration</option>
              <option value="sleep">Daily Sleep Duration</option>
              <option value="workouts">Weekly Workouts</option>
              <option value="weight">Target Body Weight</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Target Value
              </label>
              <input
                type="number"
                step="any"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Unit
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Establish Goal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
