// src/renderer/api/core/streamManager.ts
import type { BaseResponse } from "./common";

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string; // 'followers', 'subscribers', 'bits', 'views'
  createdAt: string;
}

export interface ClipResult {
  id: string;
  edit_url: string;
}

class StreamManagerAPI {
  async updateStreamInfo(
    broadcasterId: string,
    data: {
      title: string;
      game_id?: string;
      go_live_notification?: string;
      broadcaster_language?: string;
      tags?: string[];
      is_branded_content?: boolean;
      content_classification_labels?: string[];
      is_rerun?: boolean;
    },
  ): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({
      method: "updateStreamInfo",
      params: { broadcasterId, ...data },
    });
  }
  async createClip(broadcasterId: string): Promise<BaseResponse<ClipResult>> {
    return window.backendAPI["stream-manager"]({
      method: "createClip",
      params: { broadcasterId },
    });
  }
  async startRaid(
    fromBroadcasterId: string,
    toBroadcasterLogin: string,
  ): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({
      method: "startRaid",
      params: { fromBroadcasterId, toBroadcasterLogin },
    });
  }
  async banUser(
    broadcasterId: string,
    userName: string,
  ): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({
      method: "banUser",
      params: { broadcasterId, userName },
    });
  }
  async timeoutUser(
    broadcasterId: string,
    userName: string,
    duration: number,
  ): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({
      method: "timeoutUser",
      params: { broadcasterId, userName, duration },
    });
  }
  async clearChat(broadcasterId: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({
      method: "clearChat",
      params: { broadcasterId },
    });
  }
  async getGoals(): Promise<BaseResponse<Goal[]>> {
    return window.backendAPI["stream-manager"]({ method: "getGoals" });
  }
  async addGoal(
    goal: Omit<Goal, "id" | "createdAt">,
  ): Promise<BaseResponse<Goal>> {
    return window.backendAPI["stream-manager"]({
      method: "addGoal",
      params: { goal },
    });
  }
  async updateGoalProgress(
    goalId: string,
    currentValue: number,
  ): Promise<BaseResponse<void>> {
    return window.backendAPI["stream-manager"]({
      method: "updateGoalProgress",
      params: { goalId, currentValue },
    });
  }
  async isOBSRunning(): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({ method: "isOBSRunning" });
  }
  async deleteGoal(goalId: string): Promise<BaseResponse<void>> {
    return window.backendAPI["stream-manager"]({
      method: "deleteGoal",
      params: { goalId },
    });
  }
  async getStoredStreamKey(): Promise<BaseResponse<string | null>> {
    return window.backendAPI["stream-manager"]({ method: "getStreamKey" });
  }
  async saveStreamKey(key: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({
      method: "saveStreamKey",
      params: { key },
    });
  }
  async runCommercial(length: number = 30): Promise<BaseResponse<any>> {
    return window.backendAPI["stream-manager"]({
      method: "runCommercial",
      params: { length },
    });
  }

  async startAutomation(config: {
    autoRaid: boolean;
    autoClip: boolean;
    autoMessage: boolean;
    autoMessageText: string;
    raidTarget: string | null;
  }): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({
      method: "startAutomation",
      params: { config },
    });
  }

  async stopAutomation(): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({ method: "stopAutomation" });
  }

  async getAutomationStatus(): Promise<
    BaseResponse<{ running: boolean; config: any }>
  > {
    return window.backendAPI["stream-manager"]({
      method: "getAutomationStatus",
    });
  }

  async obsConnect(
    host: string = "localhost",
    port: number = 4455,
    password: string = "",
  ): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({
      method: "obsConnect",
      params: { host, port, password },
    });
  }

  async obsDisconnect(): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({ method: "obsDisconnect" });
  }

  async getOBSStatus(): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({ method: "getOBSStatus" });
  }

  async getScenes(): Promise<
    BaseResponse<Array<{ sceneName: string; sceneIndex: number }>>
  > {
    return window.backendAPI["stream-manager"]({ method: "getScenes" });
  }

  async getCurrentScene(): Promise<BaseResponse<string>> {
    return window.backendAPI["stream-manager"]({ method: "getCurrentScene" });
  }

  async setCurrentScene(sceneName: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({
      method: "setCurrentScene",
      params: { sceneName },
    });
  }

  async getStreamStatus(): Promise<
    BaseResponse<{
      outputActive: boolean;
      outputBytes: number;
      outputTimecode: string;
    }>
  > {
    return window.backendAPI["stream-manager"]({ method: "getStreamStatus" });
  }

  async getOBSStats(): Promise<
    BaseResponse<{
      cpuUsage: number;
      memoryUsage: number;
      availableDiskSpace: number;
      activeFps: number;
      renderTotalFrames: number;
      renderMissedFrames: number;
      outputTotalFrames: number;
      outputSkippedFrames: number;
      outputTotalBytes: number;
    }>
  > {
    return window.backendAPI["stream-manager"]({ method: "getOBSStats" });
  }

  async getModerators(): Promise<
    BaseResponse<
      Array<{ user_id: string; user_login: string; user_name: string }>
    >
  > {
    return window.backendAPI["stream-manager"]({ method: "getModerators" });
  }

  async addModerator(userId: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({
      method: "addModerator",
      params: { userId },
    });
  }


  async sendShoutout(targetUsername: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({
      method: "sendShoutout",
      params: { targetUsername },
    });
  }

  async removeModerator(userId: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({
      method: "removeModerator",
      params: { userId },
    });
  }

  async getUserByName(
    username: string,
  ): Promise<
    BaseResponse<{ id: string; login: string; display_name: string } | null>
  > {
    return window.backendAPI["stream-manager"]({
      method: "getUserByName",
      params: { username },
    });
  }

  async obsUpdatePassword(password: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({
      method: "obsUpdatePassword",
      params: { password },
    });
  }
  async obsClearPassword(): Promise<BaseResponse<boolean>> {
    return window.backendAPI["stream-manager"]({ method: "obsClearPassword" });
  }
}

export const streamManagerAPI = new StreamManagerAPI();
