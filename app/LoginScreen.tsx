import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { setPid } from "../lib/storage";
import { useStore } from "../lib/store";
import type { RootStackParamList } from "../App";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0 && !submitting;

  async function handleContinue() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await setPid(trimmed);
      useStore.getState().setPid(trimmed);
      navigation.replace("Feed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-8">
          <Text className="text-3xl font-bold text-ink text-center mb-2">
            Agora
          </Text>
          <Text className="text-muted text-center mb-12">
            A research discussion platform
          </Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Enter your Prolific ID"
            placeholderTextColor="#536471"
            autoCapitalize="none"
            autoCorrect={false}
            className="border border-divider rounded-xl px-4 py-3 text-ink"
            style={{ fontSize: 16 }}
            returnKeyType="go"
            onSubmitEditing={handleContinue}
          />
          <Pressable
            disabled={!canSubmit}
            onPress={handleContinue}
            className={
              canSubmit
                ? "mt-4 bg-brand rounded-xl py-3.5 items-center"
                : "mt-4 bg-brand/40 rounded-xl py-3.5 items-center"
            }
          >
            <Text className="text-white font-bold text-base">Continue</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
