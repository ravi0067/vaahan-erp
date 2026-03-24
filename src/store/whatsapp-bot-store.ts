import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BotContact {
  phone: string;       // 10-digit number
  name: string;
  role: "OWNER" | "MANAGER" | "SERVICE_MANAGER" | "SALES_EXEC" | "ACCOUNTANT";
  isActive: boolean;
}

interface WhatsAppBotState {
  isEnabled: boolean;
  botPhone: string;           // The WhatsApp Business number for the bot
  superAdminPhone: string;    // Super admin's phone (default full access)
  contacts: BotContact[];     // Registered contacts with roles
  
  setEnabled: (enabled: boolean) => void;
  setBotPhone: (phone: string) => void;
  setSuperAdminPhone: (phone: string) => void;
  addContact: (contact: BotContact) => void;
  removeContact: (phone: string) => void;
  updateContact: (phone: string, updates: Partial<BotContact>) => void;
  getContactByPhone: (phone: string) => BotContact | undefined;
  getRoleByPhone: (phone: string) => string;
}

export const useWhatsAppBotStore = create<WhatsAppBotState>()(
  persist(
    (set, get) => ({
      isEnabled: false,
      botPhone: "",
      superAdminPhone: "",
      contacts: [],
      
      setEnabled: (enabled) => set({ isEnabled: enabled }),
      setBotPhone: (phone) => set({ botPhone: phone }),
      setSuperAdminPhone: (phone) => set({ superAdminPhone: phone }),
      
      addContact: (contact) => set((s) => ({
        contacts: [...s.contacts.filter(c => c.phone !== contact.phone), contact]
      })),
      
      removeContact: (phone) => set((s) => ({
        contacts: s.contacts.filter(c => c.phone !== phone)
      })),
      
      updateContact: (phone, updates) => set((s) => ({
        contacts: s.contacts.map(c => c.phone === phone ? { ...c, ...updates } : c)
      })),
      
      getContactByPhone: (phone) => {
        const cleaned = phone.replace(/\D/g, "").slice(-10);
        return get().contacts.find(c => c.phone === cleaned && c.isActive);
      },
      
      getRoleByPhone: (phone) => {
        const cleaned = phone.replace(/\D/g, "").slice(-10);
        if (cleaned === get().superAdminPhone.replace(/\D/g, "").slice(-10)) return "SUPER_ADMIN";
        const contact = get().contacts.find(c => c.phone === cleaned && c.isActive);
        return contact?.role || "UNKNOWN";
      },
    }),
    { name: "vaahan-whatsapp-bot" }
  )
);
