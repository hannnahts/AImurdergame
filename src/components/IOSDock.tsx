export type DockItem = {
  id: string;
  label: string;
  iconEmoji?: string;
  iconSrc?: string;
  onClick: () => void;
  disabled?: boolean;
};

function DockIcon({
  label,
  iconEmoji,
  iconSrc,
  onClick,
  disabled,
}: DockItem) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      className={[
        "flex flex-col items-center gap-1 select-none",
        disabled ? "opacity-50 cursor-not-allowed" : "active:scale-[0.97]",
      ].join(" ")}
      title={disabled ? "尚未解锁" : label}
    >
      <div
        className={[
          "h-12 w-12 rounded-[18px] flex items-center justify-center",
          // 更像 iOS：高模糊 + 内阴影 + 高光边
          "bg-white/35 backdrop-blur-2xl",
          "border border-white/45",
          "shadow-[0_10px_28px_rgba(0,0,0,0.10)]",
          "ring-1 ring-black/5",
        ].join(" ")}
      >
        {iconSrc ? (
          <img
            src={iconSrc}
            alt={label}
            className="h-8 w-8 object-contain"
            draggable={false}
          />
        ) : (
          <span className="text-xl">{iconEmoji ?? "⬜"}</span>
        )}
      </div>
    </button>
  );
}

export default function IOSDock({ items }: { items: DockItem[] }) {
  return (
    <div
      className={[
        "w-full",
        "rounded-[30px]",
        "bg-white/28 backdrop-blur-3xl",
        "border border-white/40",
        "shadow-[0_22px_60px_-30px_rgba(0,0,0,0.35)]",
        "ring-1 ring-black/5",
        "px-5 py-3",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4">
        {items.map((it) => (
          <DockIcon key={it.id} {...it} />
        ))}
      </div>
    </div>
  );
}
