import { createResource, createSignal, For, Show, batch, type JSX } from "solid-js";

import { formatDateStr, createRunWeek, groupByWeek } from "./util";
import { Run, RunWeek, Day } from "./index";
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
  const { error } = await supabase
    .from("runs")
    .insert(r);
  return error;
}

export async function updateRun(r: Run) {
  console.log(r);
  const { error } = await supabase
    .from("runs")
    .update({
      name: r.name,
      planned_miles: r.planned_miles,
      actual_miles: r.actual_miles,
      notes: r.notes,
    })
    .eq("id", r.id);
  return error;
}

function sum(runs: Run[], get: (r: Run) => number) {
  return runs.reduce((acc, r) => acc + get(r), 0);
}

function sumWeek(week: RunWeek, get: (r: Run) => number) {
  return Object.values(week).reduce((acc, runs) => acc + sum(runs, get), 0);
}

interface Props {
  run?: Run;
  submit: (r: Run) => void;
  close: () => void;
}

function ModalForm(props: Props) {
  const [ runTitle, setRunTitle ] = createSignal("");
  const [ plannedMiles, setPlannedMiles ] = createSignal("");
  const [ actualMiles, setActualMiles ] = createSignal("");
  const [ runDate, setRunDate ] = createSignal("");
  const [ runNotes, setRunNotes ] = createSignal("");

  if (props.run) {
    setRunTitle(props.run.name);
    setPlannedMiles(props.run.planned_miles.toString());
    setActualMiles(props.run.actual_miles?.toString());
    setRunDate(props.run.date);
    setRunNotes(props.run.notes || "");
  }

  const submitRun = (e: Event) => {
    e.preventDefault();
    batch(() => {
      const r: Run = {
        id: props.run?.id,
        name: runTitle(),
        date: !!runDate() ? runDate() : new Date().toISOString(),
        planned_miles: parseFloat(plannedMiles()),
        actual_miles: parseFloat(actualMiles()),
        notes: runNotes(),
      };
      props.submit(r);
    });
  };

  return (
    <div class="add-run-container">
      <div class="add-run">
        <form>
          <input
            type="text"
            placeholder="run name"
            value={runTitle()}
            onInput={(e) => setRunTitle(e.currentTarget.value)}
          />
          <input
            type="date"
            placeholder="run date"
            value={runDate()}
            onInput={(e) => setRunDate(e.currentTarget.value)}
          />
          <input
            type="number"
            placeholder="planned miles"
            required
            value={plannedMiles()}
            onInput={(e) => setPlannedMiles(e.currentTarget.value)}
          />
          <input
            type="number"
            placeholder="actual miles"
            value={actualMiles()}
            onInput={(e) => setActualMiles(e.currentTarget.value)}
          />
          <textarea
            placeholder="notes"
            cols={70}
            value={runNotes()}
            onInput={(e) => setRunNotes(e.currentTarget.value)}
          />
          <div>
            <button type="button" onClick={submitRun}>
              submit
            </button>
            <button type="button" onClick={props.close}>
              cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type ModalProps = {
  run?: Run;
  submit: (r: Run) => void;
  children: (open: () => void) => JSX.Element;
};

function RunModal(props: ModalProps) {
  const [ showModal, setShowModal ] = createSignal(false);
  const onSubmit = (r: Run) => {
    props.submit(r);
    setShowModal(false);
  };
  return (
    <div>
      <Show when={showModal()}>
        <ModalForm run={props.run} submit={onSubmit} close={() => setShowModal(false)} />
      </Show>
      {props.children(() => setShowModal(true))}
    </div>
  );
}


function RunView(props: { run: Run; }) {
  return (
    <div class="run">
      <div>{props.run.name || "run"}</div>
      <div>{props.run.date}</div>
      <div>
        {props.run.planned_miles} mi / {props.run.actual_miles || "--"} mi
      </div>
      <div>{props.run.notes}</div>
      <RunModal run={props.run} submit={updateRun}>
        {(showModal) => <div onClick={showModal}>[edit]</div>}
      </RunModal>
    </div>
  );
}

function WeekView(data: RunWeek) {
  const days = Object.keys(data);
  return (
    <div>
      <div class="week-container">
        <For each={days}>
          {(day) => {
            const runs: Run[] = data[ day as Day ];
            return (
              <div class="week-item">
                <div class="week-item">{day}</div>
                {runs.length ? (
                  <div>
                    <For each={runs}>{(r) => <RunView run={r} />}</For>
                  </div>
                ) : (
                  <div class="run">
                    <RunModal submit={addRun}>
                      {(showModal) => <div onClick={showModal}>+</div>}
                    </RunModal>
                  </div>
                )}
              </div>
            );
          }}
        </For>
      </div>
      <div class="week-summary">
        total planned: {sumWeek(data, (r) => r.planned_miles)} mi | total
        completed: {sumWeek(data, (r) => r.actual_miles)} mi
      </div>
    </div>
  );
};

function App() {
  const [ runs, { refetch } ] = createResource<Run[]>(getRuns);
  const byWeek = () => groupByWeek(runs());

  return (
    <div>
      <div class="week-container">
      <h1>runlog</h1>
      <RunModal submit={(r) => addRun(r).then(refetch)}>
        {(showModal) => <h1 class="open-modal" onClick={showModal}>(+)</h1>}
      </RunModal>
      </div>
      <Show when={!runs.loading} fallback={<div>loading...</div>}>
        <div class="run-container">
          <For each={Object.entries(byWeek())}>
            {([ week, weekRuns ]) => {
              return (
                <div class="run-item">
                  <h3>Week of {formatDateStr(week)}</h3>
                  {WeekView(createRunWeek(weekRuns))}
                </div>
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
}

export default App;
