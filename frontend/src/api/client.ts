import { CropDashboard } from '../types';

const BASE_URL = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

export const api = {
  getCropDashboard: (): Promise<CropDashboard> =>
    fetch(`${BASE_URL}/crop-analytics/dashboard`).then(handleResponse<CropDashboard>),
};
