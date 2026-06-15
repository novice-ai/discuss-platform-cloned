import { Pressable, Text, View } from "react-native";

export type LikertQuestion = {
  id: string;
  label: string;
  type: "likert5" | "likert7";
  leftLabel: string;
  rightLabel: string;
};

export type RadioQuestion = {
  id: string;
  label: string;
  type: "radio";
  options: string[];
};

export type SurveyQuestion = LikertQuestion | RadioQuestion;

export function LikertScale({
  n,
  value,
  onChange,
  leftLabel,
  rightLabel,
}: {
  n: number;
  value: number | null;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
}) {
  const size = n === 7 ? 34 : 40;
  return (
    <View className="mt-2">
      <View className="flex-row justify-between">
        {Array.from({ length: n }, (_, i) => i + 1).map((p) => (
          <Pressable
            key={p}
            onPress={() => onChange(p)}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: value === p ? "#1D9BF0" : "#EFF3F4",
            }}
          >
            <Text
              style={{
                color: value === p ? "#fff" : "#0F1419",
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              {p}
            </Text>
          </Pressable>
        ))}
      </View>
      <View className="flex-row justify-between mt-1">
        <Text className="text-muted text-xs" style={{ maxWidth: 90 }}>
          {leftLabel}
        </Text>
        <Text className="text-muted text-xs text-right" style={{ maxWidth: 90 }}>
          {rightLabel}
        </Text>
      </View>
    </View>
  );
}

export function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <View className="mt-2">
      {options.map((opt) => (
        <Pressable
          key={opt}
          onPress={() => onChange(opt)}
          className="flex-row items-center py-3 border-b border-divider"
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: value === opt ? "#1D9BF0" : "#CFD9DE",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            {value === opt && (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#1D9BF0",
                }}
              />
            )}
          </View>
          <Text className="text-ink text-base">{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}
