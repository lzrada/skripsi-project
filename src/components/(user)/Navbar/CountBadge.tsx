interface CountBadgeProps {
  count: number;
  color?: string;
}

export default function CountBadge({ count, color = "bg-[#E85D04]" }: CountBadgeProps) {
  if (count <= 0) return null;
  return (
    <span
      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
        ${color} text-white text-[10px] font-bold rounded-full
        flex items-center justify-center animate-bounceIn`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
