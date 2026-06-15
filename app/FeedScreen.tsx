import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ClipboardList, Coins, LogOut, Plus, Settings } from "lucide-react-native";
import { useMemo, useRef } from "react";
import { FlatList, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import type { RootStackParamList } from "../App";
import PostActionsSheet, {
  type PostActionsSheetRef,
} from "../components/PostActionsSheet";
import PostCard from "../components/PostCard";
import { getShortIdFromPid } from "../lib/anonymize";
import { clearPid } from "../lib/storage";
import { useStore } from "../lib/store";

type Props = NativeStackScreenProps<RootStackParamList, "Feed">;

export default function FeedScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const pid = useStore((s) => s.pid);
  const posts = useStore((s) => s.posts);
  const blockedPids = useStore((s) => s.blockedPids);
  const resetUserState = useStore((s) => s.resetUserState);
  const endlineResponses = useStore((s) => s.endlineResponses);
  const tokenBalance = useStore((s) => s.tokenBalance);

  const sheetRef = useRef<PostActionsSheetRef>(null);

  const visiblePosts = useMemo(
    () => posts.filter((p) => !blockedPids.has(p.authorPid)),
    [posts, blockedPids],
  );

  const memberId = pid ? getShortIdFromPid(pid) : "----";

  async function handleLogout() {
    await clearPid();
    resetUserState();
    navigation.replace("Login");
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-divider">
        <Text className="text-ink font-bold text-base">Group: Test Group</Text>

        <View className="flex-row items-center">
          <View className="bg-divider rounded-full px-3 py-1 mr-3">
            <Text className="text-ink text-xs font-bold">Member {memberId}</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("Wallet")}
            hitSlop={10}
            className="mr-3 flex-row items-center"
          >
            <Coins size={18} color="#1D9BF0" />
            <Text className="text-brand font-bold text-sm ml-1">{tokenBalance}</Text>
          </Pressable>
          {endlineResponses === null && (
            <Pressable
              onPress={() => navigation.navigate("EndlineSurvey")}
              hitSlop={10}
              className="mr-3"
            >
              <ClipboardList size={22} color="#536471" />
            </Pressable>
          )}
          <Pressable
            onPress={() => navigation.navigate("Settings")}
            hitSlop={10}
            className="mr-3"
          >
            <Settings size={22} color="#536471" />
          </Pressable>
          <Pressable onPress={handleLogout} hitSlop={10}>
            <LogOut size={22} color="#536471" />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={visiblePosts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            isReply={false}
            onPress={() => navigation.navigate("PostDetail", { post: item })}
            onMorePress={() => sheetRef.current?.open(item.id, false)}
          />
        )}
        keyboardShouldPersistTaps="handled"
      />

      <Pressable
        onPress={() => navigation.navigate("Compose")}
        style={{
          position: "absolute",
          right: 16,
          bottom: 16 + insets.bottom,
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1D9BF0",
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 4 },
            },
            android: {
              elevation: 4,
            },
          }),
        }}
      >
        <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>

      <PostActionsSheet ref={sheetRef} />
    </SafeAreaView>
  );
}
