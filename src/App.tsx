import { createClient } from "@supabase/supabase-js";
import { createResource, createSignal, For, Show, batch } from "solid-js";

import { getMonday, formatDateStr } from "./util";


const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4bmZiaXVqanFic2hsbmpjcG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk4OTMwODEsImV4cCI6MjAwNTQ2OTA4MX0.bSa5AgyeX9ErioGMx_IF5CU5yIgkH0tN-9CG6kwZudQ';
const PROJECT_URL = 'https://dxnfbiujjqbshlnjcpnp.supabase.co';

const supabase = createClient(PROJECT_URL, ANON_KEY);

type Run = { name: string, date: string, planned_miles: number, actual_miles: number; };

async function getRuns() {
  const { data, error } = await supabase
    .from("runs")
    .select()
    .order("date", { ascending: true })
    .order("id", { ascending: true });

  return data;
};

async function addRun(r: Run) {
  const { name, planned_miles, actual_miles, date } = r;
  const { error } = await supabase
    .from("runs")
    .insert({ name, planned_miles, actual_miles, date });
  return error;
}

function sum(runs: Run[], get: (r: Run) => number) {
  return runs.reduce((acc, r) => acc + get(r), 0);
}

function App() {
  const [ runs, { refetch } ] = createResource<Run[]>(getRuns);

  // add new run
  const [ runTitle, setRunTitle ] = createSignal('');
  const [ plannedMiles, setPlannedMiles ] = createSignal('');
  const [ actualMiles, setActualMiles ] = createSignal('');
  const [ runDate, setRunDate ] = createSignal('');

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
      refetch();
      setRunTitle('');
      setPlannedMiles('');
      setActualMiles('');
      setRunDate('');
    });
  };

  return (
    <div>
      <h1>runlog</h1>
      <form>
        <input type="text" placeholder="run name" value={runTitle()} onInput={(e) => setRunTitle(e.currentTarget.value)} />
        <input type="date" placeholder="run date" value={runDate()} onInput={(e) => setRunDate((e.currentTarget.value))} />
        <input type="number" placeholder="planned miles" required value={plannedMiles()} onInput={(e) => setPlannedMiles((e.currentTarget.value))} />
        <input type="number" placeholder="actual miles" value={actualMiles()} onInput={(e) => setActualMiles((e.currentTarget.value))} />
        <button type="button" onClick={submitRun}>add run</button>
      </form>
      <Show
        when={!runs.loading}
        fallback={<div>loading...</div>}
      >
        <div class="run-container">Runs for week of {getMonday(new Date()).toDateString()}</div>
        <ul>
          <For each={runs()}>
            {(run) =>
              <li>
                {formatDateStr(run.date)} | {run.name} | {run.planned_miles} | {run.actual_miles}
              </li>
            }
          </For>
        </ul>
        <div>planned miles: {sum(runs(), r => r.planned_miles)} | actual miles: {sum(runs(), r => r.actual_miles)}</div>
      </Show>
    </div>
  );
}

export default App;
