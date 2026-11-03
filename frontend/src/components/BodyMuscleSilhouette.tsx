import React, { useState } from 'react';
import { MuscleId, MUSCLE_METADATA, analyzeTargetedMuscles } from '../utils/muscleMapper';

interface BodyMuscleSilhouetteProps {
  exercises?: Array<{ exerciseName?: string; name?: string; sets?: any[] }>;
  workoutType?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  interactive?: boolean;
  className?: string;
}

export const BodyMuscleSilhouette: React.FC<BodyMuscleSilhouetteProps> = ({
  exercises = [],
  workoutType,
  size = 'md',
  showLabels = true,
  interactive = true,
  className = '',
}) => {
  const [activeView, setActiveView] = useState<'both' | 'front' | 'back'>('both');
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleId | null>(null);

  // If cardio/running/cycling and no explicit exercises, provide sensible defaults
  const effectiveExercises =
    exercises.length > 0
      ? exercises
      : workoutType === 'running'
      ? [{ exerciseName: 'Running', sets: [{}, {}, {}] }]
      : workoutType === 'cycling'
      ? [{ exerciseName: 'Cycling', sets: [{}, {}, {}] }]
      : workoutType === 'walking'
      ? [{ exerciseName: 'Walking', sets: [{}, {}] }]
      : exercises;

  const muscleData = analyzeTargetedMuscles(effectiveExercises);

  // Determine hit status and color
  const getMuscleColor = (id: MuscleId) => {
    const data = muscleData[id];
    if (!data || data.sets === 0) {
      return '#182234'; // Unhit dark silhouette
    }
    if (hoveredMuscle === id) {
      return '#FFFFFF'; // Active hover highlight
    }
    if (data.sets >= 8) {
      return '#F59E0B'; // High volume (amber)
    }
    if (data.isPrimary) {
      return '#A3E635'; // Primary hit (electric lime)
    }
    return '#38BDF8'; // Secondary hit (cyan)
  };

  const getMuscleStroke = (id: MuscleId) => {
    const data = muscleData[id];
    if (hoveredMuscle === id) return '#FFFFFF';
    if (data && data.sets > 0) {
      return data.isPrimary ? '#84CC16' : '#0284C7';
    }
    return '#273449';
  };

  const totalHitMuscles = Object.values(muscleData).filter((m) => m.sets > 0).length;

  // Scale dimensions
  const dimensions = {
    sm: { w: 120, h: 220 },
    md: { w: 150, h: 270 },
    lg: { w: 180, h: 320 },
  }[size];

  // Common interactive path props
  const getPathProps = (id: MuscleId) => ({
    fill: getMuscleColor(id),
    stroke: getMuscleStroke(id),
    strokeWidth: '1.2',
    strokeLinejoin: 'round' as const,
    className: interactive ? 'transition-all duration-200 cursor-pointer hover:opacity-90' : '',
    onMouseEnter: () => interactive && setHoveredMuscle(id),
    onMouseLeave: () => interactive && setHoveredMuscle(null),
    onClick: () => interactive && setHoveredMuscle(hoveredMuscle === id ? null : id),
  });

  return (
    <div className={`flex flex-col items-center bg-[#0F1523] border border-[#232F42] rounded-2xl p-4 ${className}`}>
      {/* Header Controls */}
      <div className="w-full flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Targeted Anatomy
          </span>
          {totalHitMuscles > 0 ? (
            <span className="bg-lime-500/10 text-lime-400 border border-lime-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono">
              {totalHitMuscles} groups hit
            </span>
          ) : (
            <span className="text-[10px] text-gray-500">Rest / No target</span>
          )}
        </div>

        {/* View Switcher (Front / Back / Both) */}
        <div className="flex items-center bg-[#151D2C] p-0.5 rounded-lg border border-[#232F42] text-[10px]">
          <button
            type="button"
            onClick={() => setActiveView('both')}
            className={`px-2 py-0.5 rounded ${
              activeView === 'both' ? 'bg-[#2A374F] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveView('front')}
            className={`px-2 py-0.5 rounded ${
              activeView === 'front' ? 'bg-[#2A374F] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => setActiveView('back')}
            className={`px-2 py-0.5 rounded ${
              activeView === 'back' ? 'bg-[#2A374F] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Back
          </button>
        </div>
      </div>

      {/* SVG Silhouettes Container */}
      <div className="flex items-center justify-center gap-4 py-2">
        {/* FRONT VIEW SILHOUETTE */}
        {(activeView === 'both' || activeView === 'front') && (
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-gray-400 uppercase mb-1">Front</span>
            <svg
              viewBox="0 0 160 270"
              width={dimensions.w}
              height={dimensions.h}
              className="drop-shadow-md overflow-visible select-none"
            >
              <defs>
                <filter id="glow-front" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Head & Neck Base (Neutral) */}
              <ellipse cx="80" cy="22" rx="11" ry="14" fill="#182234" stroke="#273449" strokeWidth="1.2" />
              <path d="M 74 36 L 86 36 L 87 45 L 73 45 Z" fill="#182234" stroke="#273449" strokeWidth="1.2" />

              {/* Traps (Front) */}
              <path d="M 74 38 L 58 46 L 68 50 L 74 42 Z" {...getPathProps('traps')} />
              <path d="M 86 38 L 102 46 L 92 50 L 86 42 Z" {...getPathProps('traps')} />

              {/* Shoulders (Deltoids - Front) */}
              <path
                d="M 57 47 C 46 51 40 62 43 71 C 48 70 53 64 56 57 L 61 50 Z"
                {...getPathProps('shoulders')}
              />
              <path
                d="M 103 47 C 114 51 120 62 117 71 C 112 70 107 64 104 57 L 99 50 Z"
                {...getPathProps('shoulders')}
              />

              {/* Chest (Pectorals) */}
              <path
                d="M 64 52 C 56 54 54 67 56 75 C 65 79 76 77 78 70 L 78 54 Z"
                {...getPathProps('chest')}
              />
              <path
                d="M 96 52 C 104 54 106 67 104 75 C 95 79 84 77 82 70 L 82 54 Z"
                {...getPathProps('chest')}
              />

              {/* Biceps */}
              <path
                d="M 42 72 C 37 77 36 88 40 96 C 45 95 49 87 48 76 Z"
                {...getPathProps('biceps')}
              />
              <path
                d="M 118 72 C 123 77 124 88 120 96 C 115 95 111 87 112 76 Z"
                {...getPathProps('biceps')}
              />

              {/* Forearms */}
              <path
                d="M 39 98 C 32 106 29 122 33 133 C 37 134 44 123 44 109 Z"
                {...getPathProps('forearms')}
              />
              <path
                d="M 121 98 C 128 106 131 122 127 133 C 123 134 116 123 116 109 Z"
                {...getPathProps('forearms')}
              />

              {/* Hands (Neutral) */}
              <path d="M 32 135 C 30 140 31 150 34 152 C 37 151 39 144 38 135 Z" fill="#182234" stroke="#273449" />
              <path d="M 128 135 C 130 140 129 150 126 152 C 123 151 121 144 122 135 Z" fill="#182234" stroke="#273449" />

              {/* Abdominals (Upper, Mid, Lower) */}
              <path d="M 71 77 L 79 77 L 79 86 L 71 86 Z" {...getPathProps('abs')} />
              <path d="M 81 77 L 89 77 L 89 86 L 81 86 Z" {...getPathProps('abs')} />
              <path d="M 71 88 L 79 88 L 79 97 L 71 97 Z" {...getPathProps('abs')} />
              <path d="M 81 88 L 89 88 L 89 97 L 81 97 Z" {...getPathProps('abs')} />
              <path d="M 72 99 L 79 99 L 79 108 L 73 108 Z" {...getPathProps('abs')} />
              <path d="M 81 99 L 88 99 L 87 108 L 81 108 Z" {...getPathProps('abs')} />

              {/* Obliques */}
              <path d="M 57 77 C 55 89 57 101 65 109 L 69 109 L 69 77 Z" {...getPathProps('obliques')} />
              <path d="M 103 77 C 105 89 103 101 95 109 L 91 109 L 91 77 Z" {...getPathProps('obliques')} />

              {/* Pelvis Neutral */}
              <path d="M 68 110 L 92 110 L 87 124 L 73 124 Z" fill="#182234" stroke="#273449" />

              {/* Quads (Thighs) */}
              <path
                d="M 58 116 C 53 127 52 152 57 174 C 65 176 74 167 75 147 C 75 134 72 122 68 116 Z"
                {...getPathProps('quads')}
              />
              <path
                d="M 102 116 C 107 127 108 152 103 174 C 95 176 86 167 85 147 C 85 134 88 122 92 116 Z"
                {...getPathProps('quads')}
              />

              {/* Knees Neutral */}
              <path d="M 59 176 L 68 176 L 67 184 L 60 184 Z" fill="#182234" stroke="#273449" />
              <path d="M 92 176 L 101 176 L 100 184 L 93 184 Z" fill="#182234" stroke="#273449" />

              {/* Calves (Front Shin/Calf) */}
              <path
                d="M 58 186 C 55 196 55 216 61 234 L 69 234 C 71 216 70 196 68 186 Z"
                {...getPathProps('calves')}
              />
              <path
                d="M 102 186 C 105 196 105 216 99 234 L 91 234 C 89 216 90 196 92 186 Z"
                {...getPathProps('calves')}
              />

              {/* Feet Neutral */}
              <path d="M 59 236 L 70 236 L 72 248 L 56 248 Z" fill="#182234" stroke="#273449" />
              <path d="M 101 236 L 90 236 L 88 248 L 104 248 Z" fill="#182234" stroke="#273449" />
            </svg>
          </div>
        )}

        {/* BACK VIEW SILHOUETTE */}
        {(activeView === 'both' || activeView === 'back') && (
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-gray-400 uppercase mb-1">Back</span>
            <svg
              viewBox="0 0 160 270"
              width={dimensions.w}
              height={dimensions.h}
              className="drop-shadow-md overflow-visible select-none"
            >
              {/* Head & Neck Base (Neutral Back) */}
              <ellipse cx="80" cy="22" rx="11" ry="14" fill="#182234" stroke="#273449" strokeWidth="1.2" />
              <path d="M 75 36 L 85 36 L 86 44 L 74 44 Z" fill="#182234" stroke="#273449" />

              {/* Traps & Upper Back */}
              <path
                d="M 80 41 L 98 52 L 88 78 L 80 88 L 72 78 L 62 52 Z"
                {...getPathProps('traps')}
              />

              {/* Rear Deltoids */}
              <path
                d="M 59 48 C 49 52 44 62 47 70 C 52 68 57 60 61 54 Z"
                {...getPathProps('shoulders')}
              />
              <path
                d="M 101 48 C 111 52 116 62 113 70 C 108 68 103 60 99 54 Z"
                {...getPathProps('shoulders')}
              />

              {/* Triceps (Back of arms) */}
              <path
                d="M 43 73 C 38 78 37 90 41 98 C 46 96 50 87 49 76 Z"
                {...getPathProps('triceps')}
              />
              <path
                d="M 117 73 C 122 78 123 90 119 98 C 114 96 110 87 111 76 Z"
                {...getPathProps('triceps')}
              />

              {/* Forearms (Back) */}
              <path
                d="M 39 100 C 32 108 30 122 34 133 C 38 134 44 123 44 110 Z"
                {...getPathProps('forearms')}
              />
              <path
                d="M 121 100 C 128 108 130 122 126 133 C 122 134 116 123 116 110 Z"
                {...getPathProps('forearms')}
              />

              {/* Hands (Neutral) */}
              <path d="M 33 135 C 31 140 31 150 34 152 C 37 151 39 144 38 135 Z" fill="#182234" stroke="#273449" />
              <path d="M 127 135 C 129 140 129 150 126 152 C 123 151 121 144 122 135 Z" fill="#182234" stroke="#273449" />

              {/* Lats (Wings) */}
              <path
                d="M 62 58 C 57 70 57 86 65 104 L 75 98 L 74 76 Z"
                {...getPathProps('lats')}
              />
              <path
                d="M 98 58 C 103 70 103 86 95 104 L 85 98 L 86 76 Z"
                {...getPathProps('lats')}
              />

              {/* Lower Back (Erector Spinae) */}
              <path
                d="M 74 91 L 86 91 L 85 111 L 75 111 Z"
                {...getPathProps('lower_back')}
              />

              {/* Glutes */}
              <path
                d="M 59 113 C 54 122 55 139 65 145 C 73 146 78 136 78 121 L 73 113 Z"
                {...getPathProps('glutes')}
              />
              <path
                d="M 101 113 C 106 122 105 139 95 145 C 87 146 82 136 82 121 L 87 113 Z"
                {...getPathProps('glutes')}
              />

              {/* Hamstrings */}
              <path
                d="M 57 147 C 54 158 55 171 59 177 L 76 177 C 78 168 77 156 75 147 Z"
                {...getPathProps('hamstrings')}
              />
              <path
                d="M 103 147 C 106 158 105 171 101 177 L 84 177 C 82 168 83 156 85 147 Z"
                {...getPathProps('hamstrings')}
              />

              {/* Knees Back Neutral */}
              <path d="M 59 179 L 68 179 L 67 185 L 60 185 Z" fill="#182234" stroke="#273449" />
              <path d="M 92 179 L 101 179 L 100 185 L 93 185 Z" fill="#182234" stroke="#273449" />

              {/* Calves (Back Gastrocnemius & Soleus) */}
              <path
                d="M 57 187 C 52 198 53 216 61 234 L 70 234 C 73 218 72 198 67 187 Z"
                {...getPathProps('calves')}
              />
              <path
                d="M 103 187 C 108 198 107 216 99 234 L 90 234 C 87 218 88 198 93 187 Z"
                {...getPathProps('calves')}
              />

              {/* Feet Back Neutral */}
              <path d="M 59 236 L 70 236 L 68 248 L 57 248 Z" fill="#182234" stroke="#273449" />
              <path d="M 101 236 L 90 236 L 92 248 L 103 248 Z" fill="#182234" stroke="#273449" />
            </svg>
          </div>
        )}
      </div>

      {/* Hovered / Selected Muscle Detail Box */}
      {hoveredMuscle && (
        <div className="w-full mt-2 p-2 bg-[#151D2C] border border-lime-500/30 rounded-xl text-center text-xs">
          <div className="text-white font-medium flex items-center justify-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: getMuscleColor(hoveredMuscle) }}
            />
            {MUSCLE_METADATA[hoveredMuscle].label}
          </div>
          {muscleData[hoveredMuscle].sets > 0 ? (
            <div className="text-gray-300 text-[11px] mt-0.5">
              {muscleData[hoveredMuscle].sets} sets • Exercises: {muscleData[hoveredMuscle].exercises.join(', ')}
            </div>
          ) : (
            <div className="text-gray-500 text-[11px] mt-0.5">Not targeted in this workout</div>
          )}
        </div>
      )}

      {/* Legend & Badges */}
      {showLabels && totalHitMuscles > 0 && !hoveredMuscle && (
        <div className="w-full mt-2 pt-2 border-t border-[#232F42] flex flex-wrap justify-center gap-1.5">
          {Object.entries(muscleData)
            .filter(([_, data]) => data.sets > 0)
            .sort((a, b) => b[1].sets - a[1].sets)
            .map(([id, data]) => (
              <span
                key={id}
                onMouseEnter={() => interactive && setHoveredMuscle(id as MuscleId)}
                onMouseLeave={() => interactive && setHoveredMuscle(null)}
                className={`text-[10px] px-2 py-0.5 rounded-md border flex items-center gap-1 cursor-pointer transition-colors ${
                  data.isPrimary
                    ? 'bg-lime-500/10 text-lime-400 border-lime-500/30 hover:bg-lime-500/20'
                    : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
                }`}
              >
                <span>{MUSCLE_METADATA[id as MuscleId].label.split(' ')[0]}</span>
                <span className="font-mono text-[9px] opacity-75">({data.sets}s)</span>
              </span>
            ))}
        </div>
      )}
    </div>
  );
};
