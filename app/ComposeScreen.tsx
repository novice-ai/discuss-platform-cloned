import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../App";
import ComposeBox from "../components/ComposeBox";
import { useStore } from "../lib/store";

type Props = NativeStackScreenProps<RootStackParamList, "Compose">;

const MAX = 500;

export default function ComposeScreen({ navigation }: Props) {
  const [draft, setDraft] = useState("");
  const addPost = useStore((s) => s.addPost);

  const trimmed = draft.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= MAX;

  function handlePost() {
    if (!canSubmit) return;
    addPost(trimmed);
    navigation.goBack();
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-divider">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text className="text-ink text-base">Cancel</Text>
        </Pressable>
        <Pressable
          disabled={!canSubmit}
          onPress={handlePost}
          className={
            canSubmit
              ? "bg-brand rounded-full px-5 py-2"
              : "bg-brand/40 rounded-full px-5 py-2"
          }
        >
          <Text className="text-white font-bold">Post</Text>
        </Pressable>
      </View>
      <ComposeBox
        value={draft}
        onChangeText={setDraft}
        onSubmit={handlePost}
        showSubmitButton={false}
        autoFocus
      />
    </SafeAreaView>
  );
}
