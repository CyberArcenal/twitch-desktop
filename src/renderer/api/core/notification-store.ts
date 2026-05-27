import type { BaseResponse } from './common';

export interface StoredNotification {
  id: string;
  type: 'stream_online' | 'follow' | 'subscription' | 'raid' | 'hype_train';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

class NotificationStoreAPI {
  async getAll(): Promise<BaseResponse<StoredNotification[]>> {
    return window.backendAPI.notificationStore({ method: 'getAll' });
  }
  async markRead(id: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.notificationStore({ method: 'markRead', params: { id } });
  }
  async markAllRead(): Promise<BaseResponse<boolean>> {
    return window.backendAPI.notificationStore({ method: 'markAllRead' });
  }
  async delete(id: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.notificationStore({ method: 'delete', params: { id } });
  }
  async clearAll(): Promise<BaseResponse<boolean>> {
    return window.backendAPI.notificationStore({ method: 'clearAll' });
  }
}

export const notificationStoreAPI = new NotificationStoreAPI();