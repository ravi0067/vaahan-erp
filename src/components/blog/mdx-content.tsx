import { MDXRemote } from "next-mdx-remote/rsc";

const components = {
  h1: (props: any) => (
    <h1 className="text-3xl font-bold mt-10 mb-4" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="text-2xl font-bold mt-8 mb-3" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="text-xl font-semibold mt-6 mb-2" {...props} />
  ),
  p: (props: any) => (
    <p className="text-base leading-relaxed mb-4 text-muted-foreground" {...props} />
  ),
  ul: (props: any) => (
    <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />
  ),
  ol: (props: any) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />
  ),
  li: (props: any) => (
    <li className="text-muted-foreground leading-relaxed" {...props} />
  ),
  blockquote: (props: any) => (
    <blockquote
      className="border-l-4 border-primary/40 pl-4 my-6 italic text-muted-foreground"
      {...props}
    />
  ),
  strong: (props: any) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  a: (props: any) => (
    <a className="text-primary underline hover:no-underline" {...props} />
  ),
  code: (props: any) => (
    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
  ),
  pre: (props: any) => (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 text-sm" {...props} />
  ),
  hr: () => <hr className="my-8 border-border" />,
  table: (props: any) => (
    <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse border border-border text-sm" {...props} />
    </div>
  ),
  th: (props: any) => (
    <th className="border border-border bg-muted px-4 py-2 text-left font-semibold" {...props} />
  ),
  td: (props: any) => (
    <td className="border border-border px-4 py-2" {...props} />
  ),
};

interface MDXContentProps {
  source: string;
}

export function MDXContent({ source }: MDXContentProps) {
  return <MDXRemote source={source} components={components} />;
}
