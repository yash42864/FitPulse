import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { WorkoutLog, WorkoutTemplate } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { BodyMuscleSilhouette } from '../components/BodyMuscleSilhouette';
import {
  Dumbbell,
  Plus,
  Trash2,
  Calendar,
  Flame,
  Clock,
  Bookmark,
  ChevronRight,
  TrendingUp,
  Activity,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const Workouts: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Selected workout for featured anatomy spotlight
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  // Expandable cards for individual workouts in history
  const [expandedWorkoutIds, setExpandedWorkoutIds] = useState<Record<string, boolean>>({});

  // Form State
  const [workoutType, setWorkoutType] = useState<string>('strength_training');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [notes, setNotes] = useState<string>('');
  const [exercises, setExercises] = useState<any[]>([
    {
      exerciseName: 'Barbell Bench Press',
      sets: [
        { setNumber: 1, reps: 10, weightKg: 60, restTimeSeconds: 60 },
        { setNumber: 2, reps: 8, weightKg: 70, restTimeSeconds: 90 },
      ],
    },
    {
      exerciseName: 'Barbell Squat',
      sets: [
        { setNumber: 1, reps: 10, weightKg: 80, restTimeSeconds: 90 },
        { setNumber: 2, reps: 8, weightKg: 90, restTimeSeconds: 120 },
      ],
    },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const [wRes, tRes] = await Promise.all([
        api.get('/workouts?limit=30'),
        api.get('/workouts/templates'),
      ]);
      if (wRes.data?.success) {
        setWorkouts(wRes.data.data);
        if (wRes.data.data.length > 0 && !selectedWorkoutId) {
          setSelectedWorkoutId(wRes.data.data[0]._id);
        }
      }
      if (tRes.data?.success) setTemplates(tRes.data.data);
    } catch (err) {
      console.error('Failed to load workouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleAddExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        exerciseName: 'New Exercise',
        sets: [{ setNumber: 1, reps: 10, weightKg: 20, restTimeSeconds: 60 }],
      },
    ]);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    const sets = updated[exerciseIndex].sets;
    const lastSet = sets[sets.length - 1];
    sets.push({
      setNumber: sets.length + 1,
      reps: lastSet ? lastSet.reps : 10,
      weightKg: lastSet ? lastSet.weightKg : 20,
      restTimeSeconds: 60,
    });
    setExercises(updated);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_: any, i: number) => i !== setIndex);
    updated[exerciseIndex].sets.forEach((s: any, idx: number) => (s.setNumber = idx + 1));
    setExercises(updated);
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    setExercises(exercises.filter((_, i) => i !== exerciseIndex));
  };

  const loadTemplate = (tmpl: WorkoutTemplate) => {
    setWorkoutType(tmpl.category);
    setExercises(
      tmpl.exercises.map((e) => ({
        exerciseName: e.exerciseName,
        sets: Array.from({ length: e.defaultSets }, (_, i) => ({
          setNumber: i + 1,
          reps: e.defaultReps,
          weightKg: e.defaultWeightKg,
          restTimeSeconds: 60,
        })),
      }))
    );
  };

  const handleSaveWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/workouts', {
        date,
        workoutType,
        durationMinutes: Number(durationMinutes),
        exercises,
        notes,
      });
      setIsModalOpen(false);
      await fetchWorkouts();
      if (res.data?.data?._id) {
        setSelectedWorkoutId(res.data.data._id);
      }
    } catch (err) {
      console.error('Failed to save workout:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!window.confirm('Delete this workout log?')) return;
    try {
      await api.delete(`/workouts/${id}`);
      if (selectedWorkoutId === id) {
        setSelectedWorkoutId(null);
      }
      await fetchWorkouts();
    } catch (err) {
      console.error('Failed to delete workout:', err);
    }
  };

  const toggleWorkoutExpand = (id: string) => {
    setExpandedWorkoutIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const activeSpotlightWorkout =
    workouts.find((w) => w._id === selectedWorkoutId) || workouts[0] || null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Workout Tracker & Muscle Silhouette
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Anatomical muscle group mapping, strength volume tracking, and progressive overload logs
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <Plus size={18} />
          Log Workout Session
        </Button>
      </div>

      {/* FEATURED: Anatomical Muscle Silhouette Spotlight (Hevy-Style) */}
      {activeSpotlightWorkout && (
        <Card className="p-6 border-lime-500/30 bg-gradient-to-br from-[#111726] to-[#0D121F]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left info panel */}
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-lime-500/10 text-lime-400 border border-lime-500/30 px-2.5 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5">
                  <Activity size={13} />
                  Hevy-Style Muscle Anatomy Heatmap
                </span>
                <span className="text-xs text-gray-400">
                  Showing: <span className="text-white font-medium">{activeSpotlightWorkout.date}</span>
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white capitalize">
                  {activeSpotlightWorkout.workoutType.replace('_', ' ')} Session
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  Targeted muscle groups are highlighted in vibrant electric lime (primary) and cyan (secondary).
                  Hover or tap any muscle on the silhouette to inspect exercises and set volumes.
                </p>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#151D2C] p-3 rounded-xl border border-[#232F42]">
                  <span className="text-[11px] text-gray-400 block uppercase">Exercises</span>
                  <span className="text-lg font-bold text-white">
                    {activeSpotlightWorkout.exercises?.length || 0}
                  </span>
                </div>
                <div className="bg-[#151D2C] p-3 rounded-xl border border-[#232F42]">
                  <span className="text-[11px] text-gray-400 block uppercase">Duration</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {activeSpotlightWorkout.durationMinutes} min
                  </span>
                </div>
                <div className="bg-[#151D2C] p-3 rounded-xl border border-[#232F42]">
                  <span className="text-[11px] text-gray-400 block uppercase">Total Volume</span>
                  <span className="text-lg font-bold text-lime-400">
                    {(
                      activeSpotlightWorkout.exercises?.reduce((acc, ex) => {
                        return (
                          acc +
                          ex.sets.reduce((sAcc, s) => sAcc + (s.reps || 0) * (s.weightKg || 0), 0)
                        );
                      }, 0) || 0
                    ).toLocaleString()}{' '}
                    kg
                  </span>
                </div>
              </div>

              {/* Exercise Pills */}
              <div className="pt-1">
                <span className="text-xs text-gray-400 block mb-1.5">Logged Exercises in this session:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeSpotlightWorkout.exercises?.map((ex, i) => (
                    <span
                      key={i}
                      className="bg-[#182234] border border-[#2A384F] px-2.5 py-1 rounded-lg text-xs text-gray-200"
                    >
                      {ex.exerciseName} ({ex.sets?.length || 0}s)
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Muscle Silhouette Component */}
            <div className="w-full lg:w-auto flex justify-center">
              <BodyMuscleSilhouette
                exercises={activeSpotlightWorkout.exercises}
                workoutType={activeSpotlightWorkout.workoutType}
                size="md"
                interactive={true}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Templates Row */}
      {templates.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5 block">
            Saved Workout Templates
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <Card
                key={t._id}
                className="hover:border-lime-accent/40 cursor-pointer p-4 transition-all"
                onClick={() => {
                  loadTemplate(t);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-accent/20 text-violet-300 flex items-center justify-center">
                      <Bookmark size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{t.name}</h4>
                      <span className="text-xs text-gray-400">
                        {t.exercises.length} exercises • {t.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-500" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Workouts History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Workout History & Muscle Audits</h3>
          <span className="text-xs text-gray-400">{workouts.length} recorded sessions</span>
        </div>

        {workouts.length === 0 ? (
          <Card className="text-center py-10 text-gray-400">
            No workouts logged yet. Click "Log Workout Session" to record your training!
          </Card>
        ) : (
          workouts.map((w) => {
            const totalVolume = w.exercises?.reduce((acc, ex) => {
              return (
                acc +
                ex.sets.reduce((sAcc, s) => sAcc + (s.reps || 0) * (s.weightKg || 0), 0)
              );
            }, 0) || 0;

            const isSelected = selectedWorkoutId === w._id;
            const isExpanded = expandedWorkoutIds[w._id];

            return (
              <Card
                key={w._id}
                className={`p-5 transition-all ${
                  isSelected ? 'border-lime-500/50 bg-[#121927]' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#273349]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Dumbbell size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white capitalize">
                          {w.workoutType.replace('_', ' ')}
                        </h4>
                        {isSelected && (
                          <span className="bg-lime-500/20 text-lime-400 text-[10px] px-2 py-0.5 rounded font-mono">
                            Active Spotlight
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} /> {w.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} /> {w.durationMinutes} mins
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-amber-400 font-medium">
                          <Flame size={13} /> ~{w.estimatedCaloriesBurned} kcal
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {totalVolume > 0 && (
                      <Badge variant="lime">
                        Volume: {totalVolume.toLocaleString()} kg
                      </Badge>
                    )}
                    {/* View Anatomy in Spotlight Button */}
                    <button
                      onClick={() => setSelectedWorkoutId(w._id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                        isSelected
                          ? 'bg-lime-500/20 border-lime-500/40 text-lime-400'
                          : 'bg-[#151D2C] border-[#2A384F] text-gray-300 hover:border-lime-500/40'
                      }`}
                      title="Load into Anatomy Spotlight"
                    >
                      <Eye size={14} />
                      <span className="hidden sm:inline">Spotlight</span>
                    </button>
                    {/* Expand Inline Silhouette Toggle */}
                    <button
                      onClick={() => toggleWorkoutExpand(w._id)}
                      className="text-xs px-2 py-1.5 rounded-lg border bg-[#151D2C] border-[#2A384F] text-gray-300 hover:text-white"
                      title="Toggle inline anatomy view"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button
                      onClick={() => handleDeleteWorkout(w._id)}
                      className="text-gray-500 hover:text-red-400 p-1.5 rounded bg-gray-800/50 hover:bg-red-500/10 transition-colors"
                      title="Delete workout"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Inline Expandable Silhouette View */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-[#232F42] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0B0F19] p-4 rounded-xl">
                    <div className="space-y-2 text-xs">
                      <span className="font-semibold text-lime-400 uppercase tracking-wider block">
                        Inline Muscle Anatomy Breakdown
                      </span>
                      <p className="text-gray-400">
                        {w.exercises?.length || 0} exercises performed in this session.
                      </p>
                      <div className="space-y-1">
                        {w.exercises?.map((e, idx) => (
                          <div key={idx} className="text-gray-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>
                            <span>{e.exerciseName}</span>
                            <span className="text-gray-500">({e.sets?.length || 0} sets)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <BodyMuscleSilhouette
                      exercises={w.exercises}
                      workoutType={w.workoutType}
                      size="sm"
                      interactive={true}
                    />
                  </div>
                )}

                {/* Exercises list */}
                {w.exercises && w.exercises.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {w.exercises.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="p-3 bg-[#151B2B] border border-[#273349] rounded-xl text-xs space-y-1.5"
                        >
                          <div className="font-bold text-white flex items-center justify-between">
                            <span>{ex.exerciseName}</span>
                            <span className="text-gray-400 font-normal">
                              {ex.sets.length} sets
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {ex.sets.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="bg-[#1C2435] px-2 py-0.5 rounded border border-[#273349] text-gray-300 font-mono text-[11px]"
                              >
                                {s.weightKg > 0 ? `${s.weightKg}kg × ` : ''}{s.reps}r
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {w.notes && (
                  <div className="mt-3 text-xs text-gray-400 italic">
                    Note: "{w.notes}"
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Log Workout Modal with Live Muscle Silhouette Preview */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Workout Session with Muscle Anatomy"
      >
        <form onSubmit={handleSaveWorkout} className="space-y-4">
          {/* Live Preview Silhouette inside modal */}
          <div className="bg-[#0B0F19] p-3 rounded-xl border border-[#232F42] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs space-y-1">
              <span className="text-lime-400 font-semibold uppercase tracking-wider block">
                Live Muscle Target Preview
              </span>
              <p className="text-gray-400 text-[11px]">
                As you add or edit exercises, the targeted muscles update automatically.
              </p>
            </div>
            <BodyMuscleSilhouette
              exercises={exercises}
              workoutType={workoutType}
              size="sm"
              interactive={true}
              showLabels={false}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Workout Type
              </label>
              <select
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none capitalize"
              >
                <option value="strength_training">Strength Training</option>
                <option value="cardio">Cardio</option>
                <option value="running">Running</option>
                <option value="cycling">Cycling</option>
                <option value="walking">Walking</option>
                <option value="yoga">Yoga</option>
                <option value="pilates">Pilates</option>
                <option value="mobility">Mobility</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min={1}
              max={600}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
            />
          </div>

          {/* Exercises Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Exercises & Sets
              </label>
              <button
                type="button"
                onClick={handleAddExercise}
                className="text-xs text-lime-accent font-semibold hover:underline"
              >
                + Add Exercise
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {exercises.map((ex, exIdx) => (
                <div
                  key={exIdx}
                  className="p-3 bg-[#0B0F19] border border-[#273349] rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={ex.exerciseName}
                      onChange={(e) => {
                        const updated = [...exercises];
                        updated[exIdx].exerciseName = e.target.value;
                        setExercises(updated);
                      }}
                      placeholder="e.g. Bench Press, Squat, Pull-up, Bicep Curl"
                      className="bg-[#151B2B] border border-[#273349] rounded-lg px-2.5 py-1 text-xs text-white flex-1 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(exIdx)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Sets */}
                  <div className="space-y-1.5 pl-2 border-l border-[#273349]">
                    {ex.sets.map((s: any, sIdx: number) => (
                      <div key={sIdx} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400 w-10">Set {s.setNumber}:</span>
                        <input
                          type="number"
                          value={s.weightKg}
                          onChange={(e) => {
                            const updated = [...exercises];
                            updated[exIdx].sets[sIdx].weightKg = Number(e.target.value);
                            setExercises(updated);
                          }}
                          placeholder="kg"
                          className="w-16 bg-[#151B2B] border border-[#273349] rounded px-2 py-0.5 text-white text-center"
                        />
                        <span className="text-gray-400">kg ×</span>
                        <input
                          type="number"
                          value={s.reps}
                          onChange={(e) => {
                            const updated = [...exercises];
                            updated[exIdx].sets[sIdx].reps = Number(e.target.value);
                            setExercises(updated);
                          }}
                          placeholder="reps"
                          className="w-16 bg-[#151B2B] border border-[#273349] rounded px-2 py-0.5 text-white text-center"
                        />
                        <span className="text-gray-400">reps</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSet(exIdx, sIdx)}
                          className="text-gray-500 hover:text-red-400 ml-auto"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddSet(exIdx)}
                      className="text-[11px] text-gray-400 hover:text-lime-accent mt-1 block"
                    >
                      + Add Set
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Session Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Great intensity, hit new 1RM on squat..."
              rows={2}
              className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Save Workout
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
