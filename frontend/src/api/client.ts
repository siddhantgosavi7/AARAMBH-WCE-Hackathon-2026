import { CropAnalysis, FarmInput, LoginResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? `Request failed: ${response.status}`);
  }
  return response.json();
}

export const api = {
  analyzeFarm: (input: FarmInput, token: string): Promise<CropAnalysis> =>
    fetch(`${BASE_URL}/crop-analytics/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(input) }).then(handleResponse<CropAnalysis>),
  getLatestAnalysis: (token: string): Promise<CropAnalysis | null> =>
    fetch(`${BASE_URL}/crop-analytics/latest`, { headers: { Authorization: `Bearer ${token}` } }).then(handleResponse<CropAnalysis | null>),

  login: (username: string, password: string): Promise<LoginResponse> => {
    const body = new URLSearchParams({ username, password });
    return fetch(`${BASE_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    }).then(handleResponse<LoginResponse>);
  },
};
