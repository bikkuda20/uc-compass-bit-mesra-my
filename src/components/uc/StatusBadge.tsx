
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    verified: "bg-blue-100 text-blue-800",
    default: "bg-gray-100 text-gray-800"
  };

  const colorClass = statusColors[status?.toLowerCase()] || statusColors.default;

  return (
    <Badge variant="secondary" className={colorClass}>
      {status?.toUpperCase() || 'PENDING'}
    </Badge>
  );
};
