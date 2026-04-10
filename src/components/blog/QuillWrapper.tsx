"use client";

import { useEffect, useRef } from "react";
import type Quill from "quill";
import "quill/dist/quill.snow.css";

interface QuillWrapperProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  theme?: string;
  modules?: Record<string, unknown>;
  formats?: string[];
}

export default function QuillWrapper({ value, onChange, placeholder, modules }: QuillWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);
  const isInternalChange = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    let quill: Quill;

    import("quill").then(({ default: QuillClass }) => {
      if (!containerRef.current || quillRef.current) return;

      quill = new QuillClass(containerRef.current, {
        theme: "snow",
        placeholder: placeholder || "Blog content likhein...",
        modules: modules || {},
      });

      quillRef.current = quill;

      if (value) {
        isInternalChange.current = true;
        quill.clipboard.dangerouslyPasteHTML(value);
        isInternalChange.current = false;
      }

      quill.on("text-change" as Parameters<typeof quill.on>[0], () => {
        if (!isInternalChange.current) {
          onChangeRef.current(quill.root.innerHTML);
        }
      });
    });

    return () => {
      if (quillRef.current) {
        quillRef.current.off("text-change" as Parameters<typeof quillRef.current.off>[0]);
        quillRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    if (quill.root.innerHTML !== value) {
      const selection = quill.getSelection();
      isInternalChange.current = true;
      quill.clipboard.dangerouslyPasteHTML(value || "");
      isInternalChange.current = false;
      if (selection) {
        try {
          quill.setSelection(selection.index, selection.length);
        } catch {}
      }
    }
  }, [value]);

  return <div ref={containerRef} className="bg-white" />;
}
