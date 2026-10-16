import { useEffect, useState } from "react";

const STORAGE_KEY = "ecotwin-sustainability-goal-v1";

type GoalData = {
  goalKg: number;
  achievedKg: number;
};

const DEFAULT_GOAL: GoalData = {
  goalKg: 20,
  achievedKg: 0,
};

export default function SustainabilityGoals() {
  const [data, setData] = useState<GoalData>(DEFAULT_GOAL);
  const [goalInput, setGoalInput] = useState("20");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GoalData;
        if (
          Number.isFinite(parsed.goalKg) &&
          Number.isFinite(parsed.achievedKg)
        ) {
          setData(parsed);
          setGoalInput(String(parsed.goalKg));
        }
      }
    } catch {
      // Use the default goal if saved data cannot be read.
    }
  }, []);

  function saveGoal() {
    const goalKg = Number(goalInput);

    if (!Number.isFinite(goalKg) || goalKg <= 0) return;

    const next = { ...data, goalKg };
    setData(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  const progress =
    data.goalKg > 0
      ? Math.min(100, Math.round((data.achievedKg / data.goalKg) * 100))
      : 0;

  const remaining = Math.max(0, data.goalKg - data.achievedKg);

  return (
    <section className="space-y-5 rounded-2xl border border-emerald-500/30 bg-slate-950 p-5 text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-2xl">
          🌱
        </div>
        <div>
          <h2 className="text-xl font-bold">
            My Sustainability Journey
          </h2>
          <p className="text-sm text-slate-400">
            Set a goal. Track your impact. Build a greener community.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Monthly goal</p>
          <p className="mt-1 text-3xl font-bold text-emerald-400">
            {data.goalKg} kg
          </p>
          <p className="text-xs text-slate-500">
            Target waste recycled
          </p>
        </div>

        <div className="rounded-xl bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Achieved so far</p>
          <p className="mt-1 text-3xl font-bold">
            {data.achievedKg} kg
          </p>
          <p className="text-xs text-slate-500">
            Recorded recycled waste
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold">Goal progress</p>
          <p className="font-bold text-emerald-400">{progress}%</p>
        </div>

        <div
          className="h-3 overflow-hidden rounded-full bg-slate-800"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Monthly sustainability goal progress"
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-sm text-slate-400">
          {remaining > 0
            ? `${remaining} kg more to reach your goal.`
            : "Goal reached! Keep up the sustainable work."}
        </p>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-4">
        <p className="font-semibold">🎯 Set your monthly target</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="number"
            min="1"
            step="1"
            value={goalInput}
            onChange={(event) => setGoalInput(event.target.value)}
            aria-label="Monthly recycling goal in kilograms"
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
          <button
            type="button"
            onClick={saveGoal}
            className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
          >
            Save Goal
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Achievements start at zero until connected to verified scan or
        collection records. No environmental impact is estimated here.
      </p>
    </section>
  );
}