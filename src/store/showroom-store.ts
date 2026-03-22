import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type ShowroomType, type ShowroomConfig, showroomConfig } from "@/lib/showroom-config";

interface ShowroomState {
  showroomType: ShowroomType;
  setShowroomType: (type: ShowroomType) => void;
  getConfig: () => ShowroomConfig;
}

export const useShowroomStore = create<ShowroomState>()(
  persist(
    (set, get) => ({
      showroomType: "BIKE",
      setShowroomType: (type: ShowroomType) => set({ showroomType: type }),
      getConfig: () => showroomConfig[get().showroomType],
    }),
    { name: "vaahan-showroom" }
  )
);
