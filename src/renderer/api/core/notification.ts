// src/renderer/api/core/notification.ts
import type { BaseResponse } from './common';

class NotificationAPI {
  async show(title: string, body: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.notification({
      method: 'show',
      params: { title, body }
    });
  }

  async notifyStreamLive(channelName: string, gameName: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.notification({
      method: 'notifyStreamLive',
      params: { channelName, gameName }
    });
  }

  async notifyFollow(userName: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.notification({
      method: 'notifyFollow',
      params: { userName }
    });
  }

  async isEnabled(): Promise<BaseResponse<boolean>> {
    return window.backendAPI.notification({ method: 'isEnabled' });
  }

  async setEnabled(enabled: boolean): Promise<BaseResponse<boolean>> {
    return window.backendAPI.notification({
      method: 'setEnabled',
      params: { enabled }
    });
  }
}

export const notificationAPI = new NotificationAPI();