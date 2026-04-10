"use client";

import dynamic from "next/dynamic";

const QuillWrapper = dynamic(() => import("./QuillWrapper"), {
  ssr: false,
  loading: () => (
    <div className="h-64 rounded-lg border bg-muted animate-pulse flex items-center justify-center text-muted-foreground text-sm">
      Loading editor...
    </div>
  ),
});

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ color: [] }, { background: [] }],
  ["blockquote", "code-block"],
  ["link", "image"],
  ["clean"],
];

interface BlogEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function BlogEditor({ value, onChange, placeholder }: BlogEditorProps) {
  return (
    <>
      <style>{`
        .ql-container { min-height: 320px; font-size: 15px; font-family: inherit; }
        .ql-editor { min-height: 320px; }
        .ql-toolbar.ql-snow { border-top-left-radius: 8px; border-top-right-radius: 8px; border-color: #e5e7eb; }
        .ql-container.ql-snow { border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; border-color: #e5e7eb; }
        .ql-editor.ql-blank::before { color: #9ca3af; font-style: normal; }
      `}</style>
      <QuillWrapper
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Blog content likhein..."}
        modules={{ toolbar: TOOLBAR_OPTIONS }}
        formats={["header","bold","italic","underline","strike","list","bullet","color","background","blockquote","code-block","link","image"]}
      />
    </>
  );
}
