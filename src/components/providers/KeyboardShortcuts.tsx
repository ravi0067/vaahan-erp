"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const shortcuts = [
  { keys: ["Ctrl", "K"], description: "Focus search bar" },
  { keys: ["Ctrl", "B"], description: "New Booking" },
  { keys: ["Ctrl", "L"], description: "New Lead" },
  { keys: ["Ctrl", "/"], description: "Show keyboard shortcuts" },
  { keys: ["Esc"], description: "Close any open modal" },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if typing in input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        if (e.key === "Escape") {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "k":
            e.preventDefault();
            const searchInput = document.querySelector<HTMLInputElement>(
              'input[placeholder*="Search"]'
            );
            searchInput?.focus();
            break;
          case "b":
            e.preventDefault();
            router.push("/bookings/new");
            break;
          case "l":
            e.preventDefault();
            router.push("/leads");
            break;
          case "/":
            e.preventDefault();
            setHelpOpen(true);
            break;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  return (
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>⌨️ Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {shortcuts.map((s) => (
            <div
              key={s.description}
              className="flex items-center justify-between"
            >
              <span className="text-sm">{s.description}</span>
              <div className="flex gap-1">
                {s.keys.map((k) => (
                  <Badge
                    key={k}
                    variant="outline"
                    className="font-mono text-xs px-2"
                  >
                    {k}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
