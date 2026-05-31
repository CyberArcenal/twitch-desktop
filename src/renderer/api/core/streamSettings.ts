import type { BaseResponse } from "./common";

export interface IngestServer {
  id: string;
  name: string;
  url_template: string;
  default: boolean;
  availability: number;
}

class StreamSettingsAPI {
  async getStreamKey(): Promise<BaseResponse<{ stream_key: string }>> {
    return window.backendAPI.streamSettings({ method: "getStreamKey" });
  }

  async getIngestServers(): Promise<BaseResponse<IngestServer[]>> {
    return window.backendAPI.streamSettings({ method: "getIngestServers" });
  }

  async regenerateStreamKey(): Promise<BaseResponse<{ stream_key: string }>> {
    return window.backendAPI.streamSettings({ method: "regenerateStreamKey" });
  }


}

export const streamSettingsAPI = new StreamSettingsAPI();
