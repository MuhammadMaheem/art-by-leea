/**
 * Badge — Small status indicator pill.
 *
 * Used to display order/commission status with color-coded backgrounds.
 */
import { cn } from "@/utils/cn";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  shipped: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};

interface BadgeProps {
  status: string;
  className?: string;
  children?: React.ReactNode;
}

export default function Badge({ status, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        statusColors[status] || "bg-gray-100 text-gray-800",
        className
      )}
    >
      {children || status}
    </span>
  );
}
