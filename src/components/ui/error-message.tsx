import { Text, View } from "react-native";

type ErrorMessageProps = {
  message?: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <View className="mb-4 rounded-lg bg-red-50 px-4 py-3">
      <Text className="text-sm leading-relaxed text-red-600">{message}</Text>
    </View>
  );
}
