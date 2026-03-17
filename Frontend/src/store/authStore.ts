import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const Role = {
  SiteManager: 1,
  AssistantManager: 2,
  BlockManager: 3,
  HomeOwner: 4,
  Tenant: 5,
  Staff: 6,
  BlockStaff: 7
} as const;

export type RoleValue = typeof Role[keyof typeof Role];

export interface User {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  role: RoleValue;
  roleName: string;
  blockId?: number;
  blockName?: string;
  apartmentNumber?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem('sinerji_token');
        localStorage.removeItem('sinerji_user');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
