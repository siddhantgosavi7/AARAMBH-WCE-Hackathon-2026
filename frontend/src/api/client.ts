import { CropDashboard, LoginResponse } from '../types';

const BASE_URL = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? `Request failed: ${response.status}`);
  }
  return response.json();
}

export const api = {
  getCropDashboard: (): Promise<CropDashboard> =>
    fetch(`${BASE_URL}/crop-analytics/dashboard`).then(handleResponse<CropDashboard>),

  login: (username: string, password: string): Promise<LoginResponse> => {
    const body = new URLSearchParams({ username, password });
    return fetch(`${BASE_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    }).then(handleResponse<LoginResponse>);
  },
};

