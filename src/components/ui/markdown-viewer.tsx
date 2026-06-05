import { sanitizeMarkdownLine } from "@/lib/markdown";
import type { ReactNode } from "react";

type MarkdownViewerProps = {
  children: string;
};

export function MarkdownViewer({ children }: MarkdownViewerProps) {
  const blocks = children.split("\n");
  const elements: ReactNode[] = [];
  let list: string[] = [];

  function flushList() {
    if (!list.length) return;
    elements.push(
      <ul className="grid list-disc gap-2 pl-5 text-white/72" key={`list-${elements.length}`}>
        {list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>,
    );
    list = [];
  }

  blocks.forEach((line, index) => {
    const value = sanitizeMarkdownLine(line);
    if (value.startsWith("- ")) {
      list.push(value.slice(2));
      return;
    }
    flushList();
    if (!value) return;
    if (value.startsWith("# ")) {
      elements.push(
        <h2 className="text-[28px] leading-tight font-black" key={index}>
          {value.slice(2)}
        </h2>,
      );
    } else if (value.startsWith("## ")) {
      elements.push(
        <h3 className="text-xl leading-tight font-black" key={index}>
          {value.slice(3)}
        </h3>,
      );
    } else {
      elements.push(
        <p className="leading-[1.72] text-white/72" key={index}>
          {value}
        </p>,
      );
    }
  });
  flushList();

  return (
    <div className="grid gap-4 text-white">{elements}</div>
  );
}
