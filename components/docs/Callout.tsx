import { ReactNode } from "react";

type CalloutType = "note" | "tip" | "warning" | "info";

interface CalloutProps {
  type?: CalloutType;
  children: ReactNode;
}

const styles = {
  note: {
    icon: "📝",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    title: "Note",
  },
  tip: {
    icon: "💡",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    title: "Tip",
  },
  warning: {
    icon: "⚠️",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    title: "Warning",
  },
  info: {
    icon: "ℹ️",
    border: "border-sky-500/30",
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    title: "Info",
  },
};

export function Callout({
  type = "note",
  children,
}: CalloutProps) {
  const style = styles[type];

  return (
    <div
      className={`my-6 rounded-xl border ${style.border} ${style.bg} p-5`}
    >
      <div className="flex items-center gap-2 mb-3 font-semibold">
        <span>{style.icon}</span>
        <span className={style.text}>{style.title}</span>
      </div>

      <div className="prose prose-invert max-w-none">
        {children}
      </div>
    </div>
  );
}