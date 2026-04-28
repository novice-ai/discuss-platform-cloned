import { Heart, MessageCircle } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import type { ReactionCounts } from "../types";

type Kind = "reply" | "like";

interface ReactionBarProps {
  reactions: ReactionCounts;
  active?: { reply?: boolean; like?: boolean };
  onPress?: (kind: Kind) => void;
}

const ICON_SIZE = 18;
const INACTIVE = "#536471";
const REPLY_ACTIVE = "#1D9BF0";
const LIKE_ACTIVE = "#F91880";

export default function ReactionBar({
  reactions,
  active,
  onPress,
}: ReactionBarProps) {
  const replyColor = active?.reply ? REPLY_ACTIVE : INACTIVE;
  const likeColor = active?.like ? LIKE_ACTIVE : INACTIVE;
  return (
    <View className="mt-2 flex-row items-center">
      <Pressable
        onPress={() => onPress?.("reply")}
        className="flex-row items-center mr-10"
        hitSlop={8}
      >
        <MessageCircle size={ICON_SIZE} color={replyColor} />
        <Text style={{ color: replyColor }} className="ml-1.5 text-sm">
          {reactions.reply}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onPress?.("like")}
        className="flex-row items-center"
        hitSlop={8}
      >
        <Heart size={ICON_SIZE} color={likeColor} />
        <Text style={{ color: likeColor }} className="ml-1.5 text-sm">
          {reactions.like}
        </Text>
      </Pressable>
    </View>
  );
}
