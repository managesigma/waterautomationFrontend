export interface MasterDevice {
  _id: string;
  type: 'MASTER';
  pmcId: string;
  stationId: string;
  masterName: string;
  masterId: string;
  ipAddress: string;
  firmwareVersion: string;
  slaveIds: string[];
  status: 'ONLINE' | 'OFFLINE';
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlaveDevice {
  _id: string;
  type: 'SLAVE';
  pmcId: string;
  stationId: string;
  masterId: string;
  poleId: string;
  firmwareVersion: string;
  status: 'ONLINE' | 'OFFLINE';
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterMasterRequest {
  pmcId: string;
  masterName: string;
  masterId: string;
  ipAddress: string;
  firmwareVersion: string;
  stationId: string;
}

export interface UpdateMasterRequest {
  masterName?: string;
  ipAddress?: string;
  firmwareVersion?: string;
  stationId?: string;
  status?: 'ONLINE' | 'OFFLINE';
}

export interface RegisterSlaveRequest {
  pmcId?: string;
  slaves: {
    slaveDeviceId: string;
    firmwareVersion: string;
    stationId: string;
    poleId: string;
  } | Array<{
    slaveDeviceId: string;
    firmwareVersion: string;
    stationId: string;
    poleId: string;
  }>;
}

export interface UpdateSlaveRequest {
  firmwareVersion?: string;
  stationId?: string;
  poleId?: string;
  status?: 'ONLINE' | 'OFFLINE';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  timestamp: string;
}
