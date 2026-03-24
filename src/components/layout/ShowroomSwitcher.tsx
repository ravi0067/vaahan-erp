"use client";

import { useShowroomStore } from "@/store/showroom-store";
import { showroomConfig } from "@/lib/showroom-config";

export function ShowroomSwitcher() {
  const { showroomType } = useShowroomStore();
  const config = showroomConfig[showroomType];

  return (
    <div className="flex items-center gap-1.5 h-9 px-3 rounded-md border bg-muted/50 text-sm">
      <span className="text-base leading-none">{config.emoji}</span>
      <span className="hidden sm:inline font-medium">{config.label}</span>
    </div>
  );
}
