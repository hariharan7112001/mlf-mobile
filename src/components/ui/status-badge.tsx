import { Text, View } from "react-native";

type StatusBadgeProps = {
  status: string;
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
  approved: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Approved" },
  scheduled: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Scheduled" },
  completed: { bg: "bg-sky-50", text: "text-sky-700", label: "Completed" },
  rejected: { bg: "bg-red-50", text: "text-red-700", label: "Rejected" },
  cancelled: { bg: "bg-slate-100", text: "text-slate-500", label: "Cancelled" },
};

/** Colored status pill — maps leave/appointment `status` strings to a consistent style. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const style =
    STATUS_STYLES[status] ?? { bg: "bg-slate-100", text: "text-slate-600", label: status };

  return (
    <View className={`self-start rounded-full px-3 py-1 ${style.bg}`}>
      <Text className={`text-xs font-semibold ${style.text}`}>{style.label}</Text>
    </View>
  );
}
