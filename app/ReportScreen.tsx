import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { format } from "date-fns";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../App";
import { getHandleFromPid } from "../lib/anonymize";
import { TOKEN_COSTS, useStore } from "../lib/store";

type Props = NativeStackScreenProps<RootStackParamList, "Report">;

const MAX = 500;
const MIN = 10;

export default function ReportScreen({ navigation, route }: Props) {
  const { item, isReply } = route.params;
  const [reason, setReason] = useState("");
  const addReport = useStore((s) => s.addReport);
  const tokenBalance = useStore((s) => s.tokenBalance);
  const canAfford = useStore((s) => s.canAfford);

  const trimmed = reason.trim();
  const over = reason.length > MAX;
  const canSubmit = trimmed.length >= MIN && !over && canAfford(TOKEN_COSTS.REPORT);

  function handleSubmit() {
    if (!canSubmit) return;
    const ok = addReport(item.id, item.authorPid, trimmed);
    if (!ok) {
      Alert.alert("Insufficient tokens", `Reporting costs ${TOKEN_COSTS.REPORT} tokens. You have ${tokenBalance}.`);
      return;
    }
    Alert.alert("Report submitted", "Thank you.", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  }

  const handle = getHandleFromPid(item.authorPid);
  const ts = format(new Date(item.createdAt), "MMM d, h:mm a");

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-divider">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text className="text-ink text-base">Cancel</Text>
        </Pressable>
        <Pressable
          disabled={!canSubmit}
          onPress={handleSubmit}
          className={
            canSubmit
              ? "bg-brand rounded-full px-5 py-2"
              : "bg-brand/40 rounded-full px-5 py-2"
          }
        >
          <Text className="text-white font-bold">Submit (−{TOKEN_COSTS.REPORT})</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-ink font-bold text-xl mb-3">
            Report this {isReply ? "reply" : "post"}
          </Text>

          <View
            className="border border-divider rounded-xl p-3 mb-5"
            style={{ opacity: 0.6 }}
          >
            <View className="flex-row items-center mb-1">
              <Text className="text-ink font-bold">{handle}</Text>
              <Text className="text-muted mx-1.5">·</Text>
              <Text className="text-muted text-sm">{ts}</Text>
            </View>
            <Text className="text-ink" style={{ fontSize: 15, lineHeight: 21 }}>
              {item.body}
            </Text>
          </View>

          <Text className="text-ink font-bold mb-2">
            Please add more details
          </Text>
          <TextInput
            multiline
            value={reason}
            onChangeText={setReason}
            placeholder="What's wrong with this post? (e.g. harassment, spam, off-topic, threats…)"
            placeholderTextColor="#536471"
            className="border border-divider rounded-xl px-4 py-3 text-ink"
            style={{
              fontSize: 16,
              lineHeight: 22,
              minHeight: 120,
              textAlignVertical: "top",
            }}
          />
          <View className="mt-2 flex-row justify-end">
            <Text
              className={over ? "text-red-500 text-xs" : "text-muted text-xs"}
            >
              {reason.length} / {MAX}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
