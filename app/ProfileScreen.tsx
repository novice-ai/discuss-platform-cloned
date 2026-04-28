import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MoreHorizontal } from "lucide-react-native";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import type { RootStackParamList } from "../App";
import Avatar from "../components/Avatar";
import PostActionsSheet, {
  type PostActionsSheetRef,
} from "../components/PostActionsSheet";
import PostCard from "../components/PostCard";
import { getHandleFromPid } from "../lib/anonymize";
import { useStore } from "../lib/store";
import type { Post, Reply } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

type AuthoredItem =
  | { kind: "post"; item: Post }
  | { kind: "reply"; item: Reply };

const DESTRUCTIVE = "#F4212E";

export default function ProfileScreen({ navigation, route }: Props) {
  const { pid } = route.params;
  const handle = getHandleFromPid(pid);

  const postSheetRef = useRef<PostActionsSheetRef>(null);
  const userSheetRef = useRef<BottomSheetModal>(null);

  const myPid = useStore((s) => s.pid);
  const posts = useStore((s) => s.posts);
  const replies = useStore((s) => s.replies);
  const blockedPids = useStore((s) => s.blockedPids);
  const blockUser = useStore((s) => s.blockUser);
  const unblockUser = useStore((s) => s.unblockUser);

  const isOwn = myPid === pid;
  const isBlocked = blockedPids.has(pid);
  const showHeaderMenu = !isOwn && !isBlocked;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: showHeaderMenu
        ? () => (
            <Pressable
              onPress={() => userSheetRef.current?.present()}
              hitSlop={10}
              style={{ paddingHorizontal: 4 }}
            >
              <MoreHorizontal size={22} color="#536471" />
            </Pressable>
          )
        : undefined,
    });
  }, [navigation, showHeaderMenu]);

  const userPosts = useMemo(
    () => posts.filter((p) => p.authorPid === pid),
    [posts, pid],
  );
  const userReplies = useMemo(
    () => replies.filter((r) => r.authorPid === pid),
    [replies, pid],
  );

  const items = useMemo<AuthoredItem[]>(() => {
    const merged: AuthoredItem[] = [
      ...userPosts.map((p) => ({ kind: "post" as const, item: p })),
      ...userReplies.map((r) => ({ kind: "reply" as const, item: r })),
    ];
    merged.sort(
      (a, b) =>
        new Date(b.item.createdAt).getTime() -
        new Date(a.item.createdAt).getTime(),
    );
    return merged;
  }, [userPosts, userReplies]);

  function parentHandleFor(reply: Reply): string {
    const parent = posts.find((p) => p.id === reply.postId);
    return parent ? getHandleFromPid(parent.authorPid) : "Unknown";
  }

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  function handleBlockFromSheet() {
    userSheetRef.current?.dismiss();
    Alert.alert(
      `Block ${handle}?`,
      "You won't see their posts or replies.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: () => blockUser(pid),
        },
      ],
    );
  }

  if (isBlocked) {
    return (
      <View className="flex-1 bg-bg">
        <View className="bg-bg px-4 pt-8 pb-4 items-center border-b border-divider">
          <Avatar pid={pid} size={64} />
          <Text className="text-ink font-bold text-2xl mt-3">{handle}</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-muted text-base mb-4">
            You blocked this user.
          </Text>
          <Pressable
            onPress={() => unblockUser(pid)}
            className="border border-divider rounded-full px-6 py-2"
          >
            <Text className="text-ink font-bold">Unblock</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <FlatList
        data={items}
        keyExtractor={(it) => `${it.kind}-${it.item.id}`}
        renderItem={({ item }) =>
          item.kind === "post" ? (
            <PostCard
              post={item.item}
              isReply={false}
              onMorePress={() => postSheetRef.current?.open(item.item.id, false)}
            />
          ) : (
            <PostCard
              post={item.item}
              isReply
              replyingToHandle={parentHandleFor(item.item)}
              onMorePress={() => postSheetRef.current?.open(item.item.id, true)}
            />
          )
        }
        ListHeaderComponent={
          <View className="bg-bg px-4 pt-8 pb-4 items-center border-b border-divider">
            <Avatar pid={pid} size={64} />
            <Text className="text-ink font-bold text-2xl mt-3">{handle}</Text>
            <View className="flex-row mt-2">
              <Text className="text-muted text-sm mr-4">
                <Text className="text-ink font-bold">{userPosts.length}</Text>{" "}
                {userPosts.length === 1 ? "post" : "posts"}
              </Text>
              <Text className="text-muted text-sm">
                <Text className="text-ink font-bold">{userReplies.length}</Text>{" "}
                {userReplies.length === 1 ? "reply" : "replies"}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="px-4 py-10 items-center">
            <Text className="text-muted">No posts or replies yet.</Text>
          </View>
        }
      />

      <PostActionsSheet ref={postSheetRef} />

      <BottomSheetModal
        ref={userSheetRef}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
        handleIndicatorStyle={{ backgroundColor: "#EFF3F4" }}
      >
        <BottomSheetView style={{ paddingBottom: 24 }}>
          <Pressable onPress={handleBlockFromSheet} className="px-4 py-4">
            <Text style={{ color: DESTRUCTIVE }} className="text-base">
              Block {handle}
            </Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}
