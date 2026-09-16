const API_BASE_URL = import.meta.env.VITE_API_URL || "http://0.0.0.0:8000";

async function readError(response) {
  try {
    const data = await response.json();
    return data.error?.message || data.error || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export async function predictText(text) {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function predictCsv(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/predict`, { method: "POST", body: formData });
  if (!response.ok) throw new Error(await readError(response));
  return {
    blob: await response.blob(),
    graphData: response.headers.get("X-Graph-Data"),
    statistics: response.headers.get("X-Sentiment-Statistics"),
  };
}

export { API_BASE_URL };
