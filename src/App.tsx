import {
  createSignal,
  For,
  Show,
  batch,
  type JSX,
} from "solid-js";

import { formatDateStr, createWeek, groupByWeek } from "./util";
import { Run, RunWeek } from "./index";
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
  const { error } = await supabase.from("runs").insert(r);
  return error;
}

export async function updateRun(r: Run) {
  const { error } = await supabase
    .from("runs")
    .update({
      name: r.name,
      planned_miles: r.planned_miles,
      actual_miles: r.actual_miles,
      notes: r.notes,
      date: r.date,
    })
    .eq("id", r.id);
  return error;
}

export async function deleteRun(runId: number) {
  const { error } = await supabase.from("runs").delete().eq("id", runId);
  return error;
}

function sum(runs: Run[], get: (r: Run) => number) {
  return runs.reduce((acc, r) => acc + get(r), 0);
}

function sumWeek(week: Record<string, Run[]>, get: (r: Run) => number) {
  return Object.values(week).reduce((acc, runs) => acc + sum(runs, get), 0);
}

const [runs, setRuns] = createSignal<Run[]>([]);
const refetch = () => getRuns().then((data) => setRuns(data || []));

interface Props {
  run?: Run;
  date?: string;
  submit: (r: Run) => void;
  close: () => void;
}

function ModalForm(props: Props) {
  const [runTitle, setRunTitle] = createSignal("");
  const [plannedMiles, setPlannedMiles] = createSignal("");
  const [actualMiles, setActualMiles] = createSignal("");
  const [runDate, setRunDate] = createSignal("");
  const [runNotes, setRunNotes] = createSignal("");

  if (props.run) {
    setRunTitle(props.run.name);
    setPlannedMiles(props.run.planned_miles.toString());
    setActualMiles(props.run.actual_miles?.toString());
    setRunDate(props.run.date);
    setRunNotes(props.run.notes || "");
  }

  if (props.date) {
    setRunDate(props.date);
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
            type="text"
            placeholder="planned miles"
            required
            value={plannedMiles()}
            onInput={(e) => setPlannedMiles(e.currentTarget.value)}
          />
          <input
            type="text"
            placeholder="actual miles"
            value={actualMiles() || ""}
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
        <Show when={!!props.run?.id}>
          {/* @ts-ignore */}
          <button type="button" onClick={() => deleteRun(props.run.id).then(refetch)} >
            delete
          </button>
        </Show>
      </div>
    </div>
  );
}

type ModalProps = {
  run?: Run;
  date?: string;
  submit: (r: Run) => void;
  children: (open: () => void) => JSX.Element;
};

function RunModal(props: ModalProps) {
  const [showModal, setShowModal] = createSignal(false);
  const onSubmit = (r: Run) => {
    props.submit(r);
    setShowModal(false);
  };
  return (
    <div>
      <Show when={showModal()}>
        <ModalForm
          {...props}
          submit={onSubmit}
          close={() => setShowModal(false)}
        />
      </Show>
      {props.children(() => setShowModal(true))}
    </div>
  );
}

function RunView(props: { run: Run }) {
  return (
    <div class="run">
      <Show when={props.run.name.length}>
        <div class="text-large">{props.run.name || "run"}</div>
      </Show>
      <div class="text-small run-field">{props.run.date}</div>
      <div class="run-field text-large">
        <b>{props.run.planned_miles} mi</b> /{" "}
        <i>{props.run.actual_miles || "--"} mi</i>
      </div>
      <div class="text-small run-field">{props.run.notes}</div>
      <RunModal run={props.run} submit={(r) => updateRun(r).then(refetch)}>
        {(showModal) => (
          <div class="open-modal" onClick={showModal}>
            [edit]
          </div>
        )}
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
          {(dateStr) => {
            const runs: Run[] = data[dateStr];
            return (
              <div class="week-item margin-right">
                {formatDateStr(dateStr)}
                {runs.length ? (
                  <div>
                    <For each={runs}>{(r) => <RunView run={r} />}</For>
                  </div>
                ) : (
                  <div class="run">
                    <RunModal
                      date={dateStr}
                      submit={(r) => addRun(r).then(refetch)}
                    >
                      {(showModal) => (
                        <div class="open-modal" onClick={showModal}>
                          +
                        </div>
                      )}
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
}

function App() {
  refetch();
  // const byWeek = () => groupByWeek(runs());
  const runs = () => [
    { date: "2023-01-01", planned_miles: 5, actual_miles: 5, name: "" },
    { date: "2023-01-02", planned_miles: 5, actual_miles: 5, name: "" },
    { date: "2023-01-03", planned_miles: 5, actual_miles: 5, name: "" },
    { date: "2023-01-05", planned_miles: 5, actual_miles: 5, name: "" },
  ];

  const byWeek = () => groupByWeek(runs());

  return (
    <div>
      <div class="week-container">
        <h1 class="margin-right">runlog</h1>
        <RunModal submit={(r) => addRun(r).then(refetch)}>
          {(showModal) => (
            <div class="open-modal large" onClick={showModal}>
              (+)
            </div>
          )}
        </RunModal>
      </div>
      <Show when={true} fallback={<div>loading...</div>}>
        <div class="run-container">
          <For each={Object.entries(byWeek())}>
            {([week, weekRuns]) => {
              return (
                <div class="run-week">
                  <h3>Week of {formatDateStr(week)}</h3>
                  {WeekView(createWeek(weekRuns, week))}
                </div>
              );
            }}
          </For>
          total completed in block: {sum(runs(), (r) => r.actual_miles)} mi
        </div>
      </Show>
    </div>
  );
}

export default App;
