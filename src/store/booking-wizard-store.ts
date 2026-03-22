import { create } from "zustand";

// ── Types ──────────────────────────────────────────────────────────────────
export interface CustomerData {
  id?: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  aadharNo: string;
  panNo: string;
}

export interface VehicleData {
  id: string;
  model: string;
  variant: string;
  color: string;
  engineNo: string;
  chassisNo: string;
  price: number;
}

export interface PaymentEntry {
  id: string;
  amount: number;
  mode: "Cash" | "UPI" | "NEFT" | "Bank Transfer" | "Loan";
  reference: string;
  date: string;
}

export interface FinanceData {
  required: boolean;
  provider: string;
  loanAmount: number;
  emiAmount: number;
  loanStatus: "Applied" | "Approved" | "Disbursed" | "Rejected" | "";
}

export interface DocumentData {
  aadhar: File | null;
  pan: File | null;
  form20: File | null;
  form21: File | null;
  form22: File | null;
  invoice: File | null;
  insurance: File | null;
}

interface BookingWizardState {
  currentStep: number;
  customer: CustomerData;
  vehicle: VehicleData | null;
  payments: PaymentEntry[];
  finance: FinanceData;
  documents: DocumentData;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setCustomer: (data: CustomerData) => void;
  setVehicle: (data: VehicleData) => void;
  addPayment: (entry: PaymentEntry) => void;
  removePayment: (id: string) => void;
  setFinance: (data: FinanceData) => void;
  setDocuments: (data: Partial<DocumentData>) => void;
  reset: () => void;
}

const initialCustomer: CustomerData = {
  name: "",
  mobile: "",
  email: "",
  address: "",
  aadharNo: "",
  panNo: "",
};

const initialFinance: FinanceData = {
  required: false,
  provider: "",
  loanAmount: 0,
  emiAmount: 0,
  loanStatus: "",
};

const initialDocuments: DocumentData = {
  aadhar: null,
  pan: null,
  form20: null,
  form21: null,
  form22: null,
  invoice: null,
  insurance: null,
};

export const useBookingWizardStore = create<BookingWizardState>((set) => ({
  currentStep: 1,
  customer: initialCustomer,
  vehicle: null,
  payments: [],
  finance: initialFinance,
  documents: initialDocuments,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 6) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),
  setCustomer: (data) => set({ customer: data }),
  setVehicle: (data) => set({ vehicle: data }),
  addPayment: (entry) => set((s) => ({ payments: [...s.payments, entry] })),
  removePayment: (id) => set((s) => ({ payments: s.payments.filter((p) => p.id !== id) })),
  setFinance: (data) => set({ finance: data }),
  setDocuments: (data) => set((s) => ({ documents: { ...s.documents, ...data } })),
  reset: () =>
    set({
      currentStep: 1,
      customer: initialCustomer,
      vehicle: null,
      payments: [],
      finance: initialFinance,
      documents: initialDocuments,
    }),
}));
