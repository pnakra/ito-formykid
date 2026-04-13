import { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";

interface CollapsibleCardProps {
  label: string;
  previewText: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function CollapsibleCard({ label, previewText, isOpen, onToggle, children }: CollapsibleCardProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, children]);

  return (
    <div className="rounded-[14px] bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-start gap-3 text-left hover:bg-accent/30 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="label-text mb-1">{label}</p>
          {!isOpen && (
            <p className="text-[14px] leading-relaxed truncate" style={{ color: "#5C6B5A" }}>
              {previewText}
            </p>
          )}
        </div>
        <ChevronRight
          className="h-4 w-4 shrink-0 mt-0.5 transition-transform duration-200"
          style={{
            color: "#9AA898",
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
          }}
        />
      </button>
      <div
        style={{
          maxHeight: isOpen ? (height ?? 2000) : 0,
          opacity: isOpen ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease-out, opacity 0.2s ease-out",
        }}
      >
        <div ref={contentRef} className="px-5 pb-5">
          {children}
        </div>
      </div>
    </div>
  );
}
