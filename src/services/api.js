// Thin fetch wrappers around the FastAPI backend.
// Point VITE_API_BASE at your deployed backend in a .env file, e.g.:
//   VITE_API_BASE=http://localhost:8000

const BASE = import.meta.env.VITE_API_BASE || "/api";

async function getJSON(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json();
}

export const getBrief = () => getJSON("/brief");
export const getTickers = () => getJSON("/tickers");
export const getEvents = () => getJSON("/calendar");
export const getMovers = () => getJSON("/movers");
export const getEarnings = () => getJSON("/earnings");
export const getOvernight = () => getJSON("/overnight");
