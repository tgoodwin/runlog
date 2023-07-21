import { createClient } from "@supabase/supabase-js";
import { createResource, For } from "solid-js";

const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4bmZiaXVqanFic2hsbmpjcG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk4OTMwODEsImV4cCI6MjAwNTQ2OTA4MX0.bSa5AgyeX9ErioGMx_IF5CU5yIgkH0tN-9CG6kwZudQ';

const PROJECT_URL = 'https://dxnfbiujjqbshlnjcpnp.supabase.co';

const supabase = createClient(PROJECT_URL, ANON_KEY);

async function getCountries() {
const { data } = await supabase.from("countries").select();
return data;
}

function App() {
const [countries] = createResource(getCountries);

return (
  <ul>
    <For each={countries()}>{(country) => <li>{country.name}</li>}</For>
  </ul>
);
}

export default App;
