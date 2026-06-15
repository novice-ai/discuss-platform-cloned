import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../App";
import {
  LikertScale,
  RadioGroup,
  type SurveyQuestion,
} from "../components/SurveyQuestion";
import { setBaselinePid } from "../lib/storage";
import { useStore } from "../lib/store";

type Props = NativeStackScreenProps<RootStackParamList, "BaselineSurvey">;

const QUESTIONS: SurveyQuestion[] = [
  {
    id: "ideology",
    label: "How would you describe your political views?",
    type: "likert7",
    leftLabel: "Very liberal",
    rightLabel: "Very conservative",
  },
  {
    id: "party",
    label: "Which political party do you most identify with?",
    type: "radio",
    options: ["Democrat", "Republican", "Independent", "Other", "Prefer not to say"],
  },
  {
    id: "interest",
    label: "How interested are you in politics and public affairs?",
    type: "likert5",
    leftLabel: "Not at all",
    rightLabel: "Extremely",
  },
  {
    id: "online_discuss",
    label: "How often do you discuss political topics online?",
    type: "radio",
    options: ["Never", "Rarely", "Sometimes", "Often", "Daily"],
  },
  {
    id: "govt_spending",
    label: "To what extent do you support or oppose increased government spending on social programs?",
    type: "likert7",
    leftLabel: "Strongly oppose",
    rightLabel: "Strongly support",
  },
];

export default function BaselineSurveyScreen({ navigation }: Props) {
  const submitBaseline = useStore((s) => s.submitBaseline);
  const pid = useStore((s) => s.pid);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined);

  function setAnswer(id: string, value: string | number) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit() {
    if (!allAnswered || !pid) return;
    submitBaseline(answers);
    await setBaselinePid(pid);
    navigation.replace("Feed");
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="px-4 py-4 border-b border-divider">
        <Text className="text-xl font-bold text-ink">Before you begin</Text>
        <Text className="text-muted text-sm mt-1">
          Please answer a few quick questions before joining the discussion.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
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

        <Pressable
          onPress={handleSubmit}
          disabled={!allAnswered}
          className={
            allAnswered
              ? "mt-8 bg-brand rounded-xl py-3.5 items-center"
              : "mt-8 bg-brand/40 rounded-xl py-3.5 items-center"
          }
        >
          <Text className="text-white font-bold text-base">
            Start Discussion
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
