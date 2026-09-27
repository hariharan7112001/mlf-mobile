import { Text, View } from "react-native";
import { CASE_STATUS_LABEL, CASE_STATUS_STYLE, normalizeCaseStatus } from "../constants";

/** Pipeline status pill — uses the case palette rather than the shared leave/appointment StatusBadge. */
export function CaseStatusBadge({ status }: { status: string }) {
  const s = normalizeCaseStatus(status);
  const style = CASE_STATUS_STYLE[s];
  return (
    <View className={`self-start rounded-full px-3 py-1 ${style.bg}`}>
      <Text className={`text-xs font-semibold ${style.text}`}>{CASE_STATUS_LABEL[s]}</Text>
    </View>
  );
}
