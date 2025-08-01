import { hashPassword } from './crypto';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082';
const API_PREFIX = '/api';

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Litter {
  id?: string;
  name: string;
  breed: string;
  generation: string;
  birth_date?: string;
  expected_date?: string;
  mother: ParentDog;
  father: ParentDog;
  puppies: Puppy[];
  images?: string[];
  description?: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParentDog {
  name: string;
  breed: string;
  color: string;
  weight?: number;
  health_clearances: string[];
  image_url?: string;
}

export interface Puppy {
  id?: string;
  name: string;
  gender: string;
  color: string;
  birth_date: string;
  estimated_adult_weight?: number;
  status: 'available' | 'reserved' | 'sold';
  images: string[];
  videos: string[];
  microchip_id?: string;
  notes?: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('admin_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('admin_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('admin_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(username: string, hashedPassword: string): Promise<AuthResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password: hashedPassword }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async createAdminAccount(username: string, email: string, password: string, confirmPassword: string, adminPassword: string): Promise<any> {
    // Hash passwords before sending
    const hashedPassword = hashPassword(password);
    const hashedConfirmPassword = hashPassword(confirmPassword);
    const hashedAdminPassword = hashPassword(adminPassword);
    
    return this.request('/auth/admin/create-account', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password: hashedPassword,
        confirm_password: hashedConfirmPassword,
        admin_password: hashedAdminPassword
      }),
    });
  }

  // Litter endpoints
  async getLitters(): Promise<Litter[]> {
    return this.request('/litters/');
  }

  async getCurrentLitters(): Promise<Litter[]> {
    return this.request('/litters/current');
  }

  async getLitter(id: string): Promise<Litter> {
    return this.request(`/litters/${id}`);
  }

  async createLitter(litter: Omit<Litter, 'id' | 'created_at' | 'updated_at' | 'puppies'>): Promise<Litter> {
    return this.request('/litters/', {
      method: 'POST',
      body: JSON.stringify(litter),
    });
  }

  async updateLitter(id: string, litter: Partial<Litter>): Promise<Litter> {
    return this.request(`/litters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(litter),
    });
  }

  async deleteLitter(id: string): Promise<void> {
    return this.request(`/litters/${id}`, {
      method: 'DELETE',
    });
  }

  async addPuppyToLitter(litterId: string, puppy: Omit<Puppy, 'id' | 'images' | 'videos'>): Promise<Puppy> {
    return this.request(`/litters/${litterId}/puppies`, {
      method: 'POST',
      body: JSON.stringify(puppy),
    });
  }

  async updatePuppy(litterId: string, puppyId: string, puppy: Partial<Puppy>): Promise<Puppy> {
    return this.request(`/litters/${litterId}/puppies/${puppyId}`, {
      method: 'PUT',
      body: JSON.stringify(puppy),
    });
  }

  async deletePuppy(litterId: string, puppyId: string): Promise<void> {
    return this.request(`/litters/${litterId}/puppies/${puppyId}`, {
      method: 'DELETE',
    });
  }

  // Puppy image endpoints
  async uploadPuppyImage(puppyId: string, file: File): Promise<{ image_url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/puppies/${puppyId}/images`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async deletePuppyImage(puppyId: string, imageIndex: number): Promise<{ message: string }> {
    return this.request(`/puppies/${puppyId}/images/${imageIndex}`, {
      method: 'DELETE',
    });
  }

  async uploadPuppyVideo(puppyId: string, file: File): Promise<{ video_url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/puppies/${puppyId}/videos`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Contact endpoints
  async submitContactForm(contactData: {
    name: string;
    email: string;
    phone: string;
    message: string;
    puppy_name?: string;
    litter_name?: string;
  }): Promise<{ id: string; success: boolean; message: string }> {
    return this.request('/contact/', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  async getContactInquiries(): Promise<any[]> {
    return this.request('/contact/inquiries');
  }

  async markInquiryResponded(inquiryId: string): Promise<void> {
    return this.request(`/contact/inquiries/${inquiryId}/respond`, {
      method: 'PATCH',
    });
  }

  // Get individual puppy by ID
  async getPuppy(puppyId: string): Promise<any> {
    return this.request(`/puppies/${puppyId}`);
  }

  // Parent image endpoints
  async uploadMotherImage(litterId: string, file: File): Promise<{ image_url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/litters/${litterId}/mother/image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async uploadFatherImage(litterId: string, file: File): Promise<{ image_url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/litters/${litterId}/father/image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async deleteMotherImage(litterId: string): Promise<{ message: string }> {
    return this.request(`/litters/${litterId}/mother/image`, {
      method: 'DELETE',
    });
  }

  async deleteFatherImage(litterId: string): Promise<{ message: string }> {
    return this.request(`/litters/${litterId}/father/image`, {
      method: 'DELETE',
    });
  }

  // Homepage content endpoint
  async getHomepageContent(): Promise<any> {
    return this.request('/api/homepage/content');
  }

  // Hero image upload endpoint
  async uploadHeroImage(file: File, title?: string, subtitle?: string, altText?: string): Promise<{ hero_image: any; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (subtitle) formData.append('subtitle', subtitle);
    formData.append('alt_text', altText || 'Hero image');
    formData.append('order', '0');
    
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/homepage/hero-images`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Update hero image endpoint
  async updateHeroImage(heroId: string, updates: { title?: string; subtitle?: string; alt_text?: string; is_active?: boolean; order?: number }): Promise<{ message: string }> {
    return this.request(`/api/homepage/hero-images/${heroId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Delete hero image endpoint
  async deleteHeroImage(heroId: string): Promise<{ message: string }> {
    return this.request(`/api/homepage/hero-images/${heroId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();