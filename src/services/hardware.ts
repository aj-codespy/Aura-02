// Types for API Responses
export interface ServerStatusResponse {
  serverId: string;
  serverName: string;
  firmwareVersion: string;
  uptimeSeconds: number;
}

export interface NodeRegistrationResponse {
  deviceId: string;
  defaultName: string;
}

export interface LinkedNodeResponse {
  nodeId: string;
  nodeName: string;
  status: 'online' | 'offline';
  state: 'on' | 'off';
  // The API doesn't explicitly return type/category/temp in the example,
  // but we might need them. For now we'll match the spec.
}

export interface SyncDataResponse {
  newData: {
    nodeId: string;
    dataPoints: {
      timestamp: number;
      current: number;
      voltage: number;
    }[];
  }[];
  latestTimestamp: number;
}

const TIMEOUT_MS = 2000;

const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const HardwareService = {
  // 1. Server Configuration
  getServerStatus: async (ip: string): Promise<ServerStatusResponse | null> => {
    try {
      const response = await fetchWithTimeout(`http://${ip}/api/v1/status`);
      if (!response.ok) throw new Error('Status check failed');
      return await response.json();
    } catch (error) {
      // console.log(`Server at ${ip} unreachable`);
      return null;
    }
  },

  updateServerConfig: async (ip: string, name: string) => {
    const response = await fetchWithTimeout(`http://${ip}/api/v1/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverName: name }),
    });
    if (!response.ok) throw new Error('Failed to update config');
    return await response.json();
  },

  // 2. Node Registration
  registerNode: async (ip: string, pairingToken: string): Promise<NodeRegistrationResponse> => {
    const response = await fetchWithTimeout(`http://${ip}/api/v1/nodes/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairingToken }),
    });
    if (!response.ok) throw new Error('Registration failed');
    return await response.json();
  },

  // 3. Linking Management
  getLinkedNodes: async (ip: string): Promise<LinkedNodeResponse[]> => {
    const response = await fetchWithTimeout(`http://${ip}/api/v1/nodes`);
    if (!response.ok) throw new Error('Failed to fetch nodes');
    return await response.json();
  },

  linkNode: async (ip: string, nodeId: string) => {
    const response = await fetchWithTimeout(`http://${ip}/api/v1/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId }),
    });
    if (!response.ok) throw new Error('Linking failed');
    return await response.json();
  },

  deleteLink: async (ip: string, nodeId: string) => {
    const response = await fetchWithTimeout(`http://${ip}/api/v1/nodes/${nodeId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Unlink failed');
    return await response.json();
  },

  // 4. Node Control
  setNodeState: async (ip: string, nodeId: string, state: 'on' | 'off') => {
    const response = await fetchWithTimeout(`http://${ip}/api/v1/nodes/${nodeId}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });
    if (!response.ok) throw new Error('State update failed');
    return await response.json();
  },

  // 5. Scheduling
  getSchedules: async (ip: string) => {
    const response = await fetchWithTimeout(`http://${ip}/api/v1/schedules`);
    if (!response.ok) throw new Error('Failed to fetch schedules');
    return await response.json();
  },

  createSchedule: async (ip: string, schedule: any) => {
    const response = await fetchWithTimeout(`http://${ip}/api/v1/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule),
    });
    if (!response.ok) throw new Error('Failed to create schedule');
    return await response.json();
  },

  updateSchedule: async (ip: string, scheduleId: string, schedule: any) => {
    const response = await fetchWithTimeout(`http://${ip}/api/v1/schedules/${scheduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule),
    });
    if (!response.ok) throw new Error('Failed to update schedule');
    return await response.json();
  },

  deleteSchedule: async (ip: string, scheduleId: string) => {
    const response = await fetchWithTimeout(`http://${ip}/api/v1/schedules/${scheduleId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete schedule');
    return await response.json();
  },

  // 6. Data Sync
  syncData: async (ip: string, lastTimestamp: number): Promise<SyncDataResponse> => {
    const response = await fetchWithTimeout(
      `http://${ip}/api/v1/sync?lastSyncTimestamp=${lastTimestamp}`
    );
    if (!response.ok) throw new Error('Sync failed');
    return await response.json();
  },

  acknowledgeData: async (ip: string, clearUntilTimestamp: number) => {
    const response = await fetchWithTimeout(`http://${ip}/api/v1/sync`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clearUntilTimestamp }),
    });
    if (!response.ok) throw new Error('Ack failed');
    return await response.json();
  },
};
