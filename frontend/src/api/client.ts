import { Pond, Reading, FeedPlan, Alert, SavingsReport, SimulationStatus } from '../types';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    let detail = errorText;
    try {
      const parsed = JSON.parse(errorText);
      detail = parsed.detail || errorText;
    } catch {
      // Keep plain text
    }
    throw new Error(detail || `HTTP Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Ponds
  getPonds: (): Promise<Pond[]> =>
    fetch(`${BASE_URL}/ponds`).then(handleResponse<Pond[]>),

  getPond: (id: number): Promise<Pond> =>
    fetch(`${BASE_URL}/ponds/${id}`).then(handleResponse<Pond>),

  createPond: (data: any): Promise<Pond> =>
    fetch(`${BASE_URL}/ponds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<Pond>),

  // Readings
  getPondReadings: (pondId: number, limit: number = 48): Promise<Reading[]> =>
    fetch(`${BASE_URL}/ponds/${pondId}/readings?limit=${limit}`).then(handleResponse<Reading[]>),

  postReading: (data: any): Promise<Reading> =>
    fetch(`${BASE_URL}/readings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<Reading>),

  // Feeding
  getFeedPlan: (pondId: number): Promise<FeedPlan> =>
    fetch(`${BASE_URL}/ponds/${pondId}/feed-plan`).then(handleResponse<FeedPlan>),

  postFeedLog: (pondId: number, data: any): Promise<any> =>
    fetch(`${BASE_URL}/ponds/${pondId}/feed-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Alerts
  getAlerts: (activeOnly: boolean = true): Promise<Alert[]> =>
    fetch(`${BASE_URL}/alerts?active_only=${activeOnly}`).then(handleResponse<Alert[]>),

  resolveAlert: (id: number): Promise<Alert> =>
    fetch(`${BASE_URL}/alerts/${id}/resolve`, { method: 'POST' }).then(handleResponse<Alert>),

  // Reports
  getSavingsReport: (): Promise<SavingsReport> =>
    fetch(`${BASE_URL}/reports/savings`).then(handleResponse<SavingsReport>),

  // Simulator
  getSimulationStatus: (): Promise<SimulationStatus> =>
    fetch(`${BASE_URL}/simulate/status`).then(handleResponse<SimulationStatus>),

  startSimulation: (scenario: string = 'normal', tickInterval: number = 5): Promise<SimulationStatus> =>
    fetch(`${BASE_URL}/simulate/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, tick_interval_seconds: tickInterval, speed_multiplier: 60 }),
    }).then(handleResponse<SimulationStatus>),

  stopSimulation: (): Promise<SimulationStatus> =>
    fetch(`${BASE_URL}/simulate/stop`, { method: 'POST' }).then(handleResponse<SimulationStatus>),

  triggerManualTick: (): Promise<any> =>
    fetch(`${BASE_URL}/simulate/tick`, { method: 'POST' }).then(handleResponse),

  uploadCsv: (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${BASE_URL}/upload/csv`, {
      method: 'POST',
      body: formData,
    }).then(handleResponse);
  },
};
