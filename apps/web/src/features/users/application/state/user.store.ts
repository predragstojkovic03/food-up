import { create } from 'zustand';

type UserState = {
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
};

export const useUserStore = create<UserState>((set) => ({
  selectedUserId: null,
  setSelectedUserId: (id) => set({ selectedUserId: id }),
}));
