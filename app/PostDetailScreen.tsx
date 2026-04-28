import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import type { RootStackParamList } from "../App";
import ComposeBox from "../components/ComposeBox";
import PostActionsSheet, {
  type PostActionsSheetRef,
} from "../components/PostActionsSheet";
import PostCard from "../components/PostCard";
import { useStore } from "../lib/store";

type Props = NativeStackScreenProps<RootStackParamList, "PostDetail">;

export default function PostDetailScreen({ route }: Props) {
  const { post: routePost } = route.params;
  const [draft, setDraft] = useState("");

  const sheetRef = useRef<PostActionsSheetRef>(null);

  const livePost = useStore(
    (s) => s.posts.find((p) => p.id === routePost.id) ?? routePost,
  );
  const replies = useStore((s) => s.replies);
  const blockedPids = useStore((s) => s.blockedPids);
  const addReply = useStore((s) => s.addReply);

  const filteredReplies = useMemo(
    () =>
      replies
        .filter(
          (r) => r.postId === routePost.id && !blockedPids.has(r.authorPid),
        )
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [replies, routePost.id, blockedPids],
  );

  const trimmed = draft.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= 500;

  function handleSubmit() {
    if (!canSubmit) return;
    addReply(routePost.id, trimmed);
    setDraft("");
  }

  return (
    <View className="flex-1 bg-bg">
      <FlatList
        data={filteredReplies}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <View className="pl-2 border-l border-divider ml-4">
            <PostCard
              post={item}
              isReply
              onMorePress={() => sheetRef.current?.open(item.id, true)}
            />
          </View>
        )}
        ListHeaderComponent={
          <View>
            <PostCard
              post={livePost}
              variant="detail"
              onMorePress={() => sheetRef.current?.open(livePost.id, false)}
            />
            <ComposeBox
              value={draft}
              onChangeText={setDraft}
              onSubmit={handleSubmit}
              placeholder="Post your reply"
              submitLabel="Reply"
            />
          </View>
        }
        keyboardShouldPersistTaps="handled"
      />

      <PostActionsSheet ref={sheetRef} />
    </View>
  );
}
