import { createClient } from "@supabase/supabase-js";
import { createResource, For } from "solid-js";

const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4bmZiaXVqanFic2hsbmpjcG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk4OTMwODEsImV4cCI6MjAwNTQ2OTA4MX0.bSa5AgyeX9ErioGMx_IF5CU5yIgkH0tN-9CG6kwZudQ';
const PROJECT_URL = 'https://dxnfbiujjqbshlnjcpnp.supabase.co';

const supabase = createClient(PROJECT_URL, ANON_KEY);

async function getRuns() {
  const { data, error } = await supabase
    .from("runs")
    .select()
    .order("date", { ascending: true });

  return data;
};

async function addRun() {
  const { error } = await supabase.from("runs").insert({ name: 'test' });
  return error;
}

function safeSum(runs, get) {
  if (!!runs) {
    return runs.reduce((acc, r) => acc + get(r), 0);
  }
}

function App() {
  const [runs] = createResource(getRuns);
  const actualSum = () => safeSum(runs(), (r) => r.actual_miles);
  const plannedSum = () => safeSum(runs(), (r) => r.planned_miles);

  return (
    <div>
      <h1>runlog</h1>
      <ul>
        <For each={runs()}>
          {(run) =>
            <li>
              {run.date} | {run.name} {run.planned_miles} | {run.actual_miles}
            </li>
          }
        </For>
      </ul>
      <div>planned miles: {plannedSum()} | actual miles: {actualSum()}</div>
    </div>
  );
}

export default App;
