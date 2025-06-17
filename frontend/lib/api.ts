const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  data: T;
  total?: number;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Events API
  async getEvents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
  }): Promise<ApiResponse<any[]>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/events?${query.toString()}`);
  }

  async getEvent(id: string): Promise<any> {
    return this.request(`/events/${id}`);
  }

  async createEvent(data: {
    name: string;
    description?: string;
    type?: string;
    startDate: string;
    endDate?: string;
    kolIds?: string[];
    keywords?: string[];
    hashtags?: string[];
  }): Promise<any> {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(id: string, data: any): Promise<any> {
    return this.request(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(id: string): Promise<void> {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  async getEventStats(): Promise<any> {
    return this.request('/events/stats');
  }

  // KOLs API
  async getKOLs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<ApiResponse<any[]>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/kols?${query.toString()}`);
  }

  async getKOL(id: string): Promise<any> {
    return this.request(`/kols/${id}`);
  }

  async createKOL(data: {
    username: string;
    category?: string;
  }): Promise<any> {
    return this.request('/kols', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteKOL(id: string): Promise<void> {
    return this.request(`/kols/${id}`, {
      method: 'DELETE',
    });
  }

  // Auth API
  async login(username: string, password: string): Promise<{ access_token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<any> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<any> {
    return this.request('/auth/profile');
  }

  // Emotion API
  async getEmotionTrends(params?: {
    granularity?: 'hour' | 'day' | 'week' | 'month';
    startDate?: string;
    endDate?: string;
    eventId?: string;
    kolId?: string;
  }): Promise<any> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString());
        }
      });
    }
    return this.request(`/emotion/trends?${query.toString()}`);
  }

  async getEmotionHeatmap(params?: {
    startDate?: string;
    endDate?: string;
    eventId?: string;
    kolId?: string;
  }): Promise<any> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString());
        }
      });
    }
    return this.request(`/emotion/heatmap?${query.toString()}`);
  }

  async getKOLInfluence(params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<any> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString());
        }
      });
    }
    return this.request(`/emotion/kol-influence?${query.toString()}`);
  }

  async getEventComparison(params?: {
    eventIds?: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const query = new URLSearchParams();
    if (params) {
      if (params.eventIds) {
        params.eventIds.forEach(id => query.append('eventIds', id));
      }
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);
    }
    return this.request(`/emotion/event-comparison?${query.toString()}`);
  }
}

export const api = new ApiService();