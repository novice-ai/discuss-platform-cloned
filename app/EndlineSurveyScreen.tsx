import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
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
import {
  LikertScale,
  RadioGroup,
  type SurveyQuestion,
} from "../components/SurveyQuestion";
import { setEndlinePid } from "../lib/storage";
import { useStore } from "../lib/store";

type Props = NativeStackScreenProps<RootStackParamList, "EndlineSurvey">;

const QUESTIONS: SurveyQuestion[] = [
  {
    id: "ideology",
    label: "How would you describe your political views?",
    type: "likert7",
    leftLabel: "Very liberal",
    rightLabel: "Very conservative",
  },
  {
    id: "quality",
    label: "Overall, how would you rate the quality of the discussion?",
    type: "likert5",
    leftLabel: "Very poor",
    rightLabel: "Excellent",
  },
  {
    id: "moderation",
    label: "How fairly do you think the discussion was moderated?",
    type: "likert5",
    leftLabel: "Very unfairly",
    rightLabel: "Very fairly",
  },
  {
    id: "comfort",
    label: "How comfortable did you feel sharing your views?",
    type: "likert5",
    leftLabel: "Very uncomfortable",
    rightLabel: "Very comfortable",
  },
  {
    id: "future",
    label: "How likely are you to participate in similar online discussions in the future?",
    type: "likert5",
    leftLabel: "Very unlikely",
    rightLabel: "Very likely",
  },
];

export default function EndlineSurveyScreen({ navigation }: Props) {
  const submitEndline = useStore((s) => s.submitEndline);
  const endlineResponses = useStore((s) => s.endlineResponses);
  const pid = useStore((s) => s.pid);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [openText, setOpenText] = useState("");

  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined);
  const alreadyDone = endlineResponses !== null;

  function setAnswer(id: string, value: string | number) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit() {
    if (!allAnswered || !pid) return;
    submitEndline({ ...answers, open_text: openText });
    await setEndlinePid(pid);
    navigation.goBack();
  }

  if (alreadyDone) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-8">
        <Text className="text-2xl font-bold text-ink text-center mb-3">
          Survey complete
        </Text>
        <Text className="text-muted text-center mb-8">
          Your responses have already been recorded. Thank you for participating.
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          className="bg-brand rounded-xl py-3.5 px-8 items-center"
        >
          <Text className="text-white font-bold text-base">Back to Discussion</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-divider">
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text className="text-brand text-base">Cancel</Text>
        </Pressable>
        <Text className="text-ink font-bold text-base">Exit Survey</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-muted text-sm mb-6">
            Please answer a few questions about your experience before you go.
          </Text>

          {QUESTIONS.map((q, i) => (
            <View key={q.id} className={i < QUESTIONS.length - 1 ? "mb-8" : ""}>
              <Text className="text-ink font-semibold text-base">
                {i + 1}. {q.label}
              </Text>
              {q.type === "radio" ? (
                <RadioGroup
                  options={q.options}
                  value={(answers[q.id] as string) ?? null}
                  onChange={(v) => setAnswer(q.id, v)}
                />
              ) : (
                <LikertScale
                  n={q.type === "likert7" ? 7 : 5}
                  value={(answers[q.id] as number) ?? null}
                  onChange={(v) => setAnswer(q.id, v)}
                  leftLabel={q.leftLabel}
                  rightLabel={q.rightLabel}
                />
              )}
            </View>
          ))}

          <View className="mt-8">
            <Text className="text-ink font-semibold text-base mb-2">
              6. Any other thoughts about your experience? (optional)
            </Text>
            <TextInput
              value={openText}
              onChangeText={setOpenText}
              placeholder="Share anything else on your mind…"
              placeholderTextColor="#536471"
              multiline
              numberOfLines={4}
              className="border border-divider rounded-xl px-4 py-3 text-ink"
              style={{ fontSize: 15, minHeight: 96, textAlignVertical: "top" }}
            />
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={!allAnswered}
            className={
              allAnswered
                ? "mt-8 bg-brand rounded-xl py-3.5 items-center"
                : "mt-8 bg-brand/40 rounded-xl py-3.5 items-center"
            }
          >
            <Text className="text-white font-bold text-base">Submit & Finish</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
