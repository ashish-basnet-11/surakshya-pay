import { create } from "zustand";

interface ForgotPasswordState {
  email: string;
  otp: string;

  setEmail: (value: string) => void;
  setOtp: (value: string) => void;
}

export const useForgotPasswordStore = create<ForgotPasswordState>()((set) => ({
  email: "",
  otp: "",
  setOtp: (value) => set(() => ({ otp: value })),
  setEmail: (value) => set(() => ({ email: value })),
}));
