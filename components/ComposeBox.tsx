import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

interface ComposeBoxProps {
  value: string;
  onChangeText: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  max?: number;
  submitLabel?: string;
  showSubmitButton?: boolean;
  autoFocus?: boolean;
}

const LINE_HEIGHT = 22;
const MIN_HEIGHT = LINE_HEIGHT * 2;
const MAX_HEIGHT = LINE_HEIGHT * 5;

export default function ComposeBox({
  value,
  onChangeText,
  onSubmit,
  placeholder = "What's happening?",
  max = 500,
  submitLabel = "Post",
  showSubmitButton = true,
  autoFocus = false,
}: ComposeBoxProps) {
  const [height, setHeight] = useState(MIN_HEIGHT);
  const over = value.length > max;
  const canSubmit = value.trim().length > 0 && !over;

  return (
    <View className="border-b border-divider bg-bg px-4 py-3">
      <TextInput
        multiline
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#536471"
        autoFocus={autoFocus}
        className="text-ink"
        style={{
          fontSize: 16,
          lineHeight: LINE_HEIGHT,
          minHeight: MIN_HEIGHT,
          maxHeight: MAX_HEIGHT,
          height: Math.max(MIN_HEIGHT, Math.min(height, MAX_HEIGHT)),
          textAlignVertical: "top",
        }}
        onContentSizeChange={(e) => setHeight(e.nativeEvent.contentSize.height)}
      />
      <View
        className={
          showSubmitButton
            ? "mt-2 flex-row items-center justify-between"
            : "mt-2 flex-row items-center justify-end"
        }
      >
        <Text className={over ? "text-red-500 text-xs" : "text-muted text-xs"}>
          {value.length} / {max}
        </Text>
        {showSubmitButton ? (
          <Pressable
            disabled={!canSubmit}
            onPress={onSubmit}
            className={
              canSubmit
                ? "bg-brand rounded-full px-5 py-2"
                : "bg-brand/40 rounded-full px-5 py-2"
            }
          >
            <Text className="text-white font-bold">{submitLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
