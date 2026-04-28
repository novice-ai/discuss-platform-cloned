import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, format } from "date-fns";
import { MoreHorizontal } from "lucide-react-native";
import { Alert, Pressable, Text, View } from "react-native";
import type { RootStackParamList } from "../App";
import { getHandleFromPid } from "../lib/anonymize";
import { selectIsActive, useStore } from "../lib/store";
import type { Post } from "../types";
import Avatar from "./Avatar";
import ReactionBar from "./ReactionBar";

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  variant?: "feed" | "detail";
  replyingToHandle?: string;
  isReply?: boolean;
  onMorePress?: () => void;
}

function compactRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const secs = differenceInSeconds(now, d);
  if (secs < 60) return "now";
  const mins = differenceInMinutes(now, d);
  if (mins < 60) return `${mins}m`;
  const hours = differenceInHours(now, d);
  if (hours < 24) return `${hours}h`;
  const days = differenceInDays(now, d);
  if (days < 7) return `${days}d`;
  return format(d, "MMM d");
}

export default function PostCard({
  post,
  onPress,
  variant = "feed",
  replyingToHandle,
  isReply = false,
  onMorePress,
}: PostCardProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const handle = getHandleFromPid(post.authorPid);
  const time = compactRelativeTime(post.createdAt);
  const likeActive = useStore(selectIsActive(post.id, "like"));
  const toggleReaction = useStore((s) => s.toggleReaction);
  const myPid = useStore((s) => s.pid);
  const deletePost = useStore((s) => s.deletePost);
  const deleteReply = useStore((s) => s.deleteReply);

  const isOwn = myPid !== null && myPid === post.authorPid;
  const bodyClass =
    variant === "detail" ? "text-ink mt-1.5" : "text-ink mt-0.5";
  const bodyStyle =
    variant === "detail"
      ? { fontSize: 17, lineHeight: 24 }
      : { fontSize: 15, lineHeight: 21 };

  const Container: any = onPress ? Pressable : View;

  function handleMorePress() {
    if (isOwn) {
      Alert.alert(
        isReply ? "Delete this reply?" : "Delete this post?",
        undefined,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              if (isReply) deleteReply(post.id);
              else deletePost(post.id);
            },
          },
        ],
      );
    } else {
      onMorePress?.();
    }
  }

  return (
    <Container
      onPress={onPress}
      className="flex-row bg-bg px-4 py-3 border-b border-divider"
    >
      <Pressable
        onPress={() => navigation.navigate("Profile", { pid: post.authorPid })}
        hitSlop={6}
      >
        <Avatar pid={post.authorPid} />
      </Pressable>
      <View className="flex-1 ml-3">
        <View className="flex-row items-center">
          <View className="flex-1 flex-row items-center">
            <Pressable
              onPress={() =>
                navigation.navigate("Profile", { pid: post.authorPid })
              }
              hitSlop={6}
            >
              <Text className="text-ink font-bold" numberOfLines={1}>
                {handle}
              </Text>
            </Pressable>
            <Text className="text-muted mx-1.5">·</Text>
            <Text className="text-muted text-sm">{time}</Text>
          </View>
          <Pressable onPress={handleMorePress} hitSlop={10} className="ml-2">
            <MoreHorizontal size={18} color="#536471" />
          </Pressable>
        </View>
        {replyingToHandle ? (
          <Text className="text-muted text-xs mt-0.5">
            Replying to {replyingToHandle}
          </Text>
        ) : null}
        <Text className={bodyClass} style={bodyStyle}>
          {post.body}
        </Text>
        <ReactionBar
          reactions={post.reactions}
          active={{ like: likeActive }}
          onPress={(kind) => {
            if (kind === "reply") onPress?.();
            else toggleReaction(post.id, kind);
          }}
        />
      </View>
    </Container>
  );
}
