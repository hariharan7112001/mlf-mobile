import { Image } from "expo-image";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "./keyboard-aware-scroll-view";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <KeyboardAwareScrollView>
      <View className="mb-8 items-center">
        <Image
          source={require("../../assets/images/icon.png")}
          style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 16 }}
          contentFit="cover"
        />
        <Text className="text-2xl font-semibold tracking-tight text-slate-900">{title}</Text>
        <Text className="mt-2 text-center text-sm leading-relaxed text-slate-500">{subtitle}</Text>
      </View>
      {children}
    </KeyboardAwareScrollView>
  );
}
