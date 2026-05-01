import api from '../api';
import { 
  MasterDevice, 
  SlaveDevice, 
  RegisterMasterRequest, 
  UpdateMasterRequest, 
  RegisterSlaveRequest, 
  UpdateSlaveRequest,
  ApiResponse 
} from '../../types/device';

export const deviceService = {
  // Master Device Routes
  registerMaster: async (data: RegisterMasterRequest): Promise<ApiResponse<MasterDevice>> => {
    return api.post('/device/master/register', data);
  },

  getAllMasters: async (): Promise<ApiResponse<MasterDevice[]>> => {
    return api.get('/device/master');
  },

  getMasterById: async (id: string): Promise<ApiResponse<MasterDevice>> => {
    return api.get(`/device/master/${id}`);
  },

  updateMaster: async (id: string, data: UpdateMasterRequest): Promise<ApiResponse<MasterDevice>> => {
    return api.put(`/device/master/${id}`, data);
  },

  deleteMaster: async (id: string): Promise<ApiResponse<{}>> => {
    return api.delete(`/device/master/${id}`);
  },

  // Slave Device Routes
  registerSlaves: async (masterId: string, data: RegisterSlaveRequest): Promise<ApiResponse<SlaveDevice | SlaveDevice[]>> => {
    return api.post(`/device/master/${masterId}/slave/register`, data);
  },

  getSlavesByMaster: async (masterId: string): Promise<ApiResponse<SlaveDevice[]>> => {
    return api.get(`/device/master/${masterId}/slave`);
  },

  getSlaveById: async (id: string): Promise<ApiResponse<SlaveDevice>> => {
    return api.get(`/device/slave/${id}`);
  },

  updateSlave: async (id: string, data: UpdateSlaveRequest): Promise<ApiResponse<SlaveDevice>> => {
    return api.put(`/device/slave/${id}`, data);
  },

  deleteSlave: async (id: string): Promise<ApiResponse<{}>> => {
    return api.delete(`/device/slave/${id}`);
  },
};
