import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useRef, useState } from "react";
import { Modal, Pressable, Text, View, type View as RNView } from "react-native";

export type OverflowMenuItem = {
  key: string;
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  destructive?: boolean;
};

type OverflowMenuProps = {
  items: OverflowMenuItem[];
};

type Anchor = { top: number };

/** Reusable "..." dropdown menu — icon-trigger button + a list of icon+label actions. */
export function OverflowMenu({ items }: OverflowMenuProps) {
  const triggerRef = useRef<RNView>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  function openMenu() {
    triggerRef.current?.measureInWindow((_x, y, _width, height) => {
      setAnchor({ top: y + height + 6 });
    });
  }

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPress={openMenu}
        className="h-9 w-9 items-center justify-center"
        hitSlop={8}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
      </Pressable>

      <Modal
        visible={anchor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setAnchor(null)}
      >
        <Pressable className="flex-1" onPress={() => setAnchor(null)}>
          {anchor ? (
            <View
              style={{ position: "absolute", top: anchor.top, right: 16 }}
              className="w-56 overflow-hidden rounded-xl bg-white py-1 shadow-lg"
            >
              {items.map((item, index) => (
                <Pressable
                  key={item.key}
                  onPress={() => {
                    setAnchor(null);
                    item.onPress();
                  }}
                  className={`flex-row items-center gap-3 px-4 py-3 ${
                    index < items.length - 1 ? "border-b border-slate-100" : ""
                  }`}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={item.destructive ? "#dc2626" : "#334155"}
                  />
                  <Text
                    className={`text-sm font-medium ${item.destructive ? "text-red-600" : "text-slate-700"}`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}
