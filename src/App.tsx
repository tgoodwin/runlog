import { createResource, createSignal, For, Show, batch } from "solid-js";

import { formatDateStr, createRunWeek, groupByWeek } from "./util";
import { Run, RunWeek, Day } from './index';
import { createClient } from "@supabase/supabase-js";

const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const PROJECT_URL = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const supabase = createClient(PROJECT_URL, ANON_KEY);

export async function getRuns() {
  const { data, error } = await supabase
    .from("runs")
    .select()
    .order("date", { ascending: true })
    .order("id", { ascending: true });

  return data;
}

export async function addRun(r: Run) {
  const { name, planned_miles, actual_miles, date } = r;
  const { error } = await supabase
    .from("runs")
    .insert({ name, planned_miles, actual_miles, date });
  return error;
}

export async function updateRun(r: Run) {
  const { error } = await supabase
    .from("runs")
    .update({
      name: r.name,
      planned_miles: r.planned_miles,
      actual_miles: r.actual_miles,
      date: r.date,
    })
    .eq("id", r.id);
  return error;
}



function sum(runs: Run[], get: (r: Run) => number) {
  return runs.reduce((acc, r) => acc + get(r), 0);
}

function sumWeek(week: RunWeek, get: (r: Run) => number) {
  return Object.values(week).reduce((acc, runs) => acc + sum(runs, get), 0);
};

function AddRun() {
  const [ showModal, setShowModal ] = createSignal(false);
  const [ runTitle, setRunTitle ] = createSignal('');
  const [ plannedMiles, setPlannedMiles ] = createSignal('');
  const [ actualMiles, setActualMiles ] = createSignal('');
  const [ runDate, setRunDate ] = createSignal('');

  const clear = () => {
    setRunTitle('');
    setPlannedMiles('');
    setActualMiles('');
    setRunDate('');
  };

  const submitRun = (e: Event) => {
    e.preventDefault();
    batch(() => {
      const r: Run = {
        name: runTitle(),
        date: !!runDate() ? runDate() : new Date().toISOString(),
        planned_miles: parseFloat(plannedMiles()),
        actual_miles: parseFloat(actualMiles())
      };
      addRun(r);
      clear();
    });
  };

  const cancel = () => {
    setShowModal(false);
    clear();
  };

  return (
    <div class="add-run">
      <Show when={showModal()}>
        <form>
          <input type="text" placeholder="run name" value={runTitle()} onInput={(e) => setRunTitle(e.currentTarget.value)} />
          <input type="date" placeholder="run date" value={runDate()} onInput={(e) => setRunDate((e.currentTarget.value))} />
          <input type="number" placeholder="planned miles" required value={plannedMiles()} onInput={(e) => setPlannedMiles((e.currentTarget.value))} />
          <input type="number" placeholder="actual miles" value={actualMiles()} onInput={(e) => setActualMiles((e.currentTarget.value))} />
          <button type="button" onClick={submitRun}>submit</button>
          <button type="button" onClick={cancel}>cancel</button>
        </form>
      </Show>
      <button type="button" onClick={() => setShowModal(true)}>add run</button>
    </div>
  );
}

function RenderRunWeek(data: RunWeek) {
  const days = Object.keys(data);
  return (
    <div>
      <div class="week-container">
        <For each={days}>
          {(day) => <div class="week-item">{day}</div>}
        </For>
      </div>
      <div class="week-container">
        <For each={days}>
          {(day) => {
            const runs: Run[] = data[ day as Day ];
            return (
              <div class="week-item">
                <For each={runs}>
                  {(run) => (
                    <div class="run">
                      <div>{run.name || 'run'}</div>
                      <div>{run.date}</div>
                      <div>{run.planned_miles} mi / {run.actual_miles || '--'} mi</div>
                      <div>{run.notes}</div>
                    </div>
                  )}
                </For>
              </div>
            );
          }}
        </For>
      </div>
      <div class="week-summary">
        total planned: {sumWeek(data, r => r.planned_miles)} mi | total completed: {sumWeek(data, r => r.actual_miles)} mi
      </div>
    </div>
  );
}

function App() {
  const [ runs, { refetch } ] = createResource<Run[]>(getRuns);
  const byWeek = () => groupByWeek(runs());

  return (
    <div>
      <h1>runlog</h1>
      <AddRun />
      <Show
        when={!runs.loading}
        fallback={<div>loading...</div>}
      >
        <div class="run-container">
          <For each={Object.entries(byWeek())}>
            {([week, weekRuns]) => {
              return (
              <div class="run-item">
                <div>Week of {formatDateStr(week)}</div>
                {RenderRunWeek(createRunWeek(weekRuns))}
              </div>
            )}}
          </For>
        </div>
      </Show>
    </div>
  );
}

export default App;
