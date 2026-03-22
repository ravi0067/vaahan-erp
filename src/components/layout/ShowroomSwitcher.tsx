"use client";

import { useShowroomStore } from "@/store/showroom-store";
import { showroomConfig, type ShowroomType } from "@/lib/showroom-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const showroomTypes: ShowroomType[] = ["BIKE", "CAR", "EV", "MULTI"];

export function ShowroomSwitcher() {
  const { showroomType, setShowroomType } = useShowroomStore();
  const config = showroomConfig[showroomType];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-9">
          <span className="text-base leading-none">{config.emoji}</span>
          <span className="hidden sm:inline text-sm">{config.label}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {showroomTypes.map((type) => {
          const c = showroomConfig[type];
          const isActive = type === showroomType;
          return (
            <DropdownMenuItem
              key={type}
              onClick={() => setShowroomType(type)}
              className={`gap-2 ${isActive ? "bg-primary/10 font-medium" : ""}`}
            >
              <span className="text-base">{c.emoji}</span>
              <div className="flex-1">
                <p className="text-sm">{c.label}</p>
              </div>
              {isActive && (
                <span className="text-primary text-xs">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
