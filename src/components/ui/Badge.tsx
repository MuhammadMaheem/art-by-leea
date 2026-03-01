/**
 * Badge — Small status indicator pill.
 *
 * Used to display order/commission status with color-coded backgrounds.
 * Gallery-style with uppercase small-caps lettering.
 */
import { cn } from "@/utils/cn";

const statusColors: Record<string, string> = {
  pending: "bg-accent/15 text-accent",
  pending_verification: "bg-accent/15 text-accent",
  reviewing: "bg-accent/15 text-accent",
  quoted: "bg-primary/15 text-primary-dark",
  accepted: "bg-success/15 text-success",
  paid: "bg-success/15 text-success",
  "in-progress": "bg-primary/15 text-primary-dark",
  revision: "bg-accent/15 text-accent",
  completed: "bg-primary-dark/15 text-primary-dark",
  delivered: "bg-success/15 text-success",
  shipped: "bg-primary/15 text-primary-dark",
  rejected: "bg-error/15 text-error",
  cancelled: "bg-error/15 text-error",
  active: "bg-success/15 text-success",
  inactive: "bg-muted/15 text-muted",
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
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wider",
        statusColors[status] || "bg-secondary text-muted",
        className
      )}
    >
      {children || status.replace(/_/g, " ")}
    </span>
  );
}
