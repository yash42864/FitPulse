export type MuscleId =
  | 'chest'
  | 'shoulders'
  | 'traps'
  | 'lats'
  | 'lower_back'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves';

export interface MuscleTargetInfo {
  muscleId: MuscleId;
  label: string;
  category: 'upper_push' | 'upper_pull' | 'core' | 'lower';
  view: 'front' | 'back' | 'both';
  sets: number;
  exercises: string[];
}

export const MUSCLE_METADATA: Record<
  MuscleId,
  { label: string; category: 'upper_push' | 'upper_pull' | 'core' | 'lower'; view: 'front' | 'back' | 'both' }
> = {
  chest: { label: 'Chest (Pectorals)', category: 'upper_push', view: 'front' },
  shoulders: { label: 'Shoulders (Deltoids)', category: 'upper_push', view: 'both' },
  traps: { label: 'Traps & Upper Back', category: 'upper_pull', view: 'back' },
  lats: { label: 'Lats (Latissimus Dorsi)', category: 'upper_pull', view: 'back' },
  lower_back: { label: 'Lower Back (Erector Spinae)', category: 'core', view: 'back' },
  biceps: { label: 'Biceps', category: 'upper_pull', view: 'front' },
  triceps: { label: 'Triceps', category: 'upper_push', view: 'back' },
  forearms: { label: 'Forearms', category: 'upper_pull', view: 'both' },
  abs: { label: 'Abdominals (Core)', category: 'core', view: 'front' },
  obliques: { label: 'Obliques', category: 'core', view: 'front' },
  quads: { label: 'Quadriceps', category: 'lower', view: 'front' },
  hamstrings: { label: 'Hamstrings', category: 'lower', view: 'back' },
  glutes: { label: 'Glutes', category: 'lower', view: 'back' },
  calves: { label: 'Calves (Gastrocnemius)', category: 'lower', view: 'both' },
};

interface ExerciseDefinition {
  primary: MuscleId[];
  secondary: MuscleId[];
}

// Exercise dictionary matching common gym and cardio movements
const EXERCISE_DICTIONARY: Record<string, ExerciseDefinition> = {
  'bench press': { primary: ['chest'], secondary: ['triceps', 'shoulders'] },
  'barbell bench press': { primary: ['chest'], secondary: ['triceps', 'shoulders'] },
  'incline bench press': { primary: ['chest', 'shoulders'], secondary: ['triceps'] },
  'incline dumbbell press': { primary: ['chest', 'shoulders'], secondary: ['triceps'] },
  'decline bench press': { primary: ['chest'], secondary: ['triceps'] },
  'dumbbell bench press': { primary: ['chest'], secondary: ['triceps', 'shoulders'] },
  'chest fly': { primary: ['chest'], secondary: ['shoulders'] },
  'cable crossover': { primary: ['chest'], secondary: ['shoulders'] },
  'push up': { primary: ['chest'], secondary: ['triceps', 'shoulders', 'abs'] },
  'push-up': { primary: ['chest'], secondary: ['triceps', 'shoulders', 'abs'] },
  'pushups': { primary: ['chest'], secondary: ['triceps', 'shoulders', 'abs'] },
  'dips': { primary: ['chest', 'triceps'], secondary: ['shoulders'] },

  'overhead press': { primary: ['shoulders'], secondary: ['triceps', 'traps'] },
  'shoulder press': { primary: ['shoulders'], secondary: ['triceps', 'traps'] },
  'military press': { primary: ['shoulders'], secondary: ['triceps'] },
  'dumbbell shoulder press': { primary: ['shoulders'], secondary: ['triceps'] },
  'lateral raise': { primary: ['shoulders'], secondary: ['traps'] },
  'front raise': { primary: ['shoulders'], secondary: ['traps'] },
  'rear delt fly': { primary: ['shoulders', 'traps'], secondary: [] },
  'face pull': { primary: ['shoulders', 'traps'], secondary: [] },

  'pull up': { primary: ['lats'], secondary: ['biceps', 'traps', 'forearms'] },
  'pull-up': { primary: ['lats'], secondary: ['biceps', 'traps', 'forearms'] },
  'pullups': { primary: ['lats'], secondary: ['biceps', 'traps', 'forearms'] },
  'chin up': { primary: ['lats', 'biceps'], secondary: ['traps', 'forearms'] },
  'lat pulldown': { primary: ['lats'], secondary: ['biceps', 'traps'] },
  'barbell row': { primary: ['lats', 'traps'], secondary: ['biceps', 'lower_back'] },
  'bent over row': { primary: ['lats', 'traps'], secondary: ['biceps', 'lower_back'] },
  'dumbbell row': { primary: ['lats'], secondary: ['biceps', 'traps'] },
  'cable row': { primary: ['lats', 'traps'], secondary: ['biceps'] },
  't-bar row': { primary: ['lats', 'traps'], secondary: ['biceps', 'lower_back'] },

  'deadlift': { primary: ['hamstrings', 'lower_back', 'glutes'], secondary: ['traps', 'quads', 'forearms'] },
  'barbell deadlift': { primary: ['hamstrings', 'lower_back', 'glutes'], secondary: ['traps', 'quads', 'forearms'] },
  'romanian deadlift': { primary: ['hamstrings', 'glutes'], secondary: ['lower_back'] },
  'sumo deadlift': { primary: ['glutes', 'quads', 'hamstrings'], secondary: ['lower_back', 'traps'] },

  'barbell squat': { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'calves', 'lower_back'] },
  'squat': { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'calves', 'lower_back'] },
  'front squat': { primary: ['quads', 'abs'], secondary: ['glutes', 'calves'] },
  'goblet squat': { primary: ['quads', 'glutes'], secondary: ['abs'] },
  'leg press': { primary: ['quads'], secondary: ['glutes', 'hamstrings'] },
  'lunges': { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'calves'] },
  'bulgarian split squat': { primary: ['quads', 'glutes'], secondary: ['hamstrings'] },
  'leg extension': { primary: ['quads'], secondary: [] },
  'leg curl': { primary: ['hamstrings'], secondary: ['calves'] },
  'hamstring curl': { primary: ['hamstrings'], secondary: ['calves'] },
  'hip thrust': { primary: ['glutes'], secondary: ['hamstrings'] },
  'glute bridge': { primary: ['glutes'], secondary: ['hamstrings'] },

  'calf raise': { primary: ['calves'], secondary: [] },
  'standing calf raise': { primary: ['calves'], secondary: [] },
  'seated calf raise': { primary: ['calves'], secondary: [] },

  'bicep curl': { primary: ['biceps'], secondary: ['forearms'] },
  'dumbbell curl': { primary: ['biceps'], secondary: ['forearms'] },
  'barbell curl': { primary: ['biceps'], secondary: ['forearms'] },
  'hammer curl': { primary: ['biceps', 'forearms'], secondary: [] },
  'preacher curl': { primary: ['biceps'], secondary: [] },

  'tricep pushdown': { primary: ['triceps'], secondary: [] },
  'triceps pushdown': { primary: ['triceps'], secondary: [] },
  'skull crusher': { primary: ['triceps'], secondary: [] },
  'overhead tricep extension': { primary: ['triceps'], secondary: [] },
  'close grip bench press': { primary: ['triceps', 'chest'], secondary: ['shoulders'] },

  'plank': { primary: ['abs'], secondary: ['obliques', 'shoulders'] },
  'crunches': { primary: ['abs'], secondary: [] },
  'sit ups': { primary: ['abs'], secondary: [] },
  'hanging leg raise': { primary: ['abs'], secondary: ['forearms'] },
  'ab wheel': { primary: ['abs'], secondary: ['lats', 'shoulders'] },
  'russian twist': { primary: ['obliques', 'abs'], secondary: [] },

  'running': { primary: ['quads', 'calves'], secondary: ['hamstrings', 'glutes'] },
  'cycling': { primary: ['quads', 'calves'], secondary: ['glutes', 'hamstrings'] },
  'walking': { primary: ['calves', 'quads'], secondary: ['hamstrings'] },
  'yoga': { primary: ['abs', 'lower_back'], secondary: ['hamstrings', 'shoulders'] },
  'mobility': { primary: ['hamstrings', 'lower_back', 'shoulders'], secondary: [] },
};

export function analyzeTargetedMuscles(
  exercises: Array<{ exerciseName?: string; name?: string; sets?: any[] }>
): Record<MuscleId, { sets: number; exercises: string[]; isPrimary: boolean }> {
  const result: Record<MuscleId, { sets: number; exercises: string[]; isPrimary: boolean }> = {
    chest: { sets: 0, exercises: [], isPrimary: false },
    shoulders: { sets: 0, exercises: [], isPrimary: false },
    traps: { sets: 0, exercises: [], isPrimary: false },
    lats: { sets: 0, exercises: [], isPrimary: false },
    lower_back: { sets: 0, exercises: [], isPrimary: false },
    biceps: { sets: 0, exercises: [], isPrimary: false },
    triceps: { sets: 0, exercises: [], isPrimary: false },
    forearms: { sets: 0, exercises: [], isPrimary: false },
    abs: { sets: 0, exercises: [], isPrimary: false },
    obliques: { sets: 0, exercises: [], isPrimary: false },
    quads: { sets: 0, exercises: [], isPrimary: false },
    hamstrings: { sets: 0, exercises: [], isPrimary: false },
    glutes: { sets: 0, exercises: [], isPrimary: false },
    calves: { sets: 0, exercises: [], isPrimary: false },
  };

  exercises.forEach((ex) => {
    const rawName = (ex.exerciseName || ex.name || '').trim().toLowerCase();
    if (!rawName) return;

    const setCount = Array.isArray(ex.sets) && ex.sets.length > 0 ? ex.sets.length : 1;
    const displayName = ex.exerciseName || ex.name || 'Exercise';

    // 1. Direct dictionary match
    let target = EXERCISE_DICTIONARY[rawName];

    // 2. Keyword fallback matching
    if (!target) {
      const matchedPrimary: MuscleId[] = [];
      const matchedSecondary: MuscleId[] = [];

      if (rawName.includes('bench') || rawName.includes('chest') || rawName.includes('pec') || rawName.includes('fly')) {
        matchedPrimary.push('chest');
        matchedSecondary.push('triceps', 'shoulders');
      } else if (rawName.includes('shoulder') || rawName.includes('overhead') || rawName.includes('military') || rawName.includes('delt')) {
        matchedPrimary.push('shoulders');
        matchedSecondary.push('triceps');
      } else if (rawName.includes('pull') || rawName.includes('row') || rawName.includes('lat') || rawName.includes('chin')) {
        matchedPrimary.push('lats');
        matchedSecondary.push('biceps', 'traps');
      } else if (rawName.includes('deadlift') || rawName.includes('rdl')) {
        matchedPrimary.push('hamstrings', 'lower_back', 'glutes');
        matchedSecondary.push('traps');
      } else if (rawName.includes('squat') || rawName.includes('press') && rawName.includes('leg') || rawName.includes('lunge')) {
        matchedPrimary.push('quads', 'glutes');
        matchedSecondary.push('calves');
      } else if (rawName.includes('curl') || rawName.includes('bicep')) {
        matchedPrimary.push('biceps');
      } else if (rawName.includes('tricep') || rawName.includes('pushdown') || rawName.includes('skull') || rawName.includes('dip')) {
        matchedPrimary.push('triceps');
      } else if (rawName.includes('calf') || rawName.includes('calves')) {
        matchedPrimary.push('calves');
      } else if (rawName.includes('plank') || rawName.includes('crunch') || rawName.includes('ab') || rawName.includes('core')) {
        matchedPrimary.push('abs');
      } else if (rawName.includes('run') || rawName.includes('sprint') || rawName.includes('cardio')) {
        matchedPrimary.push('quads', 'calves');
        matchedSecondary.push('hamstrings');
      }

      if (matchedPrimary.length > 0) {
        target = { primary: matchedPrimary, secondary: matchedSecondary };
      }
    }

    if (target) {
      target.primary.forEach((mId) => {
        result[mId].sets += setCount;
        result[mId].isPrimary = true;
        if (!result[mId].exercises.includes(displayName)) {
          result[mId].exercises.push(displayName);
        }
      });
      target.secondary.forEach((mId) => {
        // secondary muscles get partial set credit
        result[mId].sets += Math.max(1, Math.round(setCount * 0.5));
        if (!result[mId].exercises.includes(`${displayName} (secondary)`)) {
          result[mId].exercises.push(`${displayName} (secondary)`);
        }
      });
    }
  });

  return result;
}
