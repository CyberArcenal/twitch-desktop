// src/renderer/api/core/auth.ts
import type { BaseResponse } from './common';

export interface AuthUser {
  accessToken: string;
  userId: string;
  login: string;
}

class AuthAPI {
  async login(): Promise<BaseResponse<AuthUser>> {
    return window.backendAPI.auth({ method: 'login' });
  }

  async logout(): Promise<BaseResponse<void>> {
    return window.backendAPI.auth({ method: 'logout' });
  }

  async isLoggedIn(): Promise<BaseResponse<boolean>> {
    return window.backendAPI.auth({ method: 'isLoggedIn' });
  }

  async getAccessToken(): Promise<BaseResponse<string>> {
    return window.backendAPI.auth({ method: 'getAccessToken' });
  }

  async refreshToken(): Promise<BaseResponse<boolean>> {
    return window.backendAPI.auth({ method: 'refreshToken' });
  }
  
  async revokeAllTokens(): Promise<BaseResponse<void>> {
  return window.backendAPI.auth({ method: 'revokeAllTokens' });
}
}

export const authAPI = new AuthAPI();