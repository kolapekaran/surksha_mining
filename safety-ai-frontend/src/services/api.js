const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof data === "string" ? data : data?.detail || data?.error || `API error: ${response.status}`;
    throw new Error(message);
  }
  return data;
}

export async function healthCheck() { return request("/health"); }

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function analyzeFrame(frameDataUrl) {
  const formData = new FormData();
  formData.append("file", dataUrlToBlob(frameDataUrl), "camera-frame.jpg");
  return request("/detect/all", { method: "POST", body: formData });
}

export async function getWorkers() { return request("/api/workers"); }
export async function getWorkerScore(workerId) { return request(`/api/workers/${workerId}/score`); }
export async function getAlerts() { return request("/api/alerts"); }
export async function resolveAlert(alertId) { return request(`/api/alerts/${alertId}/resolve`, { method: "POST" }); }
export async function getCameras() { return request("/api/cameras"); }
export async function getReports() { return request("/api/reports"); }
export async function getHeatmap() { return request("/api/heatmap"); }
export async function getReplayList() { return request("/api/replay"); }
export async function getReplayDetail(incidentId) { return request(`/api/replay/${incidentId}`); }

export async function runSimulation(params = {}) {
  return request("/game/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export async function getGameProfile() { return request("/game/profile"); }
export async function getGameMissions() { return request("/game/missions"); }
export async function getGameScenario(id) { return request(`/game/scenarios/${id}`); }

export async function completeGameMission(mission_id, safe, score = 0) {
  return request("/game/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mission_id, safe, score }),
  });
}

export async function mlHealth() { return request("/ml/health"); }

export async function chatbot(message, sessionId = null) {
  return request("/api/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId }),
  });
}
