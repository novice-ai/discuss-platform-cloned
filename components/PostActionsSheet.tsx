import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, Pressable, Text } from "react-native";
import type { RootStackParamList } from "../App";
import { getHandleFromPid } from "../lib/anonymize";
import { TOKEN_COSTS, useStore } from "../lib/store";

export interface PostActionsSheetRef {
  open: (id: string, isReply: boolean) => void;
}

interface Target {
  id: string;
  isReply: boolean;
}

const DESTRUCTIVE = "#F4212E";

const PostActionsSheet = forwardRef<PostActionsSheetRef>((_, ref) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const posts = useStore((s) => s.posts);
  const replies = useStore((s) => s.replies);
  const blockUser = useStore((s) => s.blockUser);
  const tokenBalance = useStore((s) => s.tokenBalance);
  const canAfford = useStore((s) => s.canAfford);

  const item = useMemo(() => {
    if (!target) return null;
    return target.isReply
      ? replies.find((r) => r.id === target.id) ?? null
      : posts.find((p) => p.id === target.id) ?? null;
  }, [target, posts, replies]);

  useImperativeHandle(ref, () => ({
    open: (id, isReply) => {
      setTarget({ id, isReply });
      sheetRef.current?.present();
    },
  }));

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

  function handleReport() {
    if (!item) return;
    sheetRef.current?.dismiss();
    navigation.navigate("Report", {
      item,
      isReply: target?.isReply ?? false,
    });
  }

  function handleBlock() {
    if (!item) return;
    const handle = getHandleFromPid(item.authorPid);
    sheetRef.current?.dismiss();
    if (!canAfford(TOKEN_COSTS.BLOCK_USER)) {
      Alert.alert(
        "Insufficient tokens",
        `Blocking costs ${TOKEN_COSTS.BLOCK_USER} tokens. You have ${tokenBalance}.`,
      );
      return;
    }
    Alert.alert(
      `Block ${handle}?`,
      `You won't see their posts or replies. Costs ${TOKEN_COSTS.BLOCK_USER} tokens (balance: ${tokenBalance}).`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: () => blockUser(item.authorPid),
        },
      ],
    );
  }

  const reportLabel = target?.isReply ? "Report reply" : "Report post";
  const blockLabel = item ? `Block ${getHandleFromPid(item.authorPid)}` : "Block";

  return (
    <BottomSheetModal
      ref={sheetRef}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }}
      handleIndicatorStyle={{ backgroundColor: "#EFF3F4" }}
      onDismiss={() => setTarget(null)}
    >
      <BottomSheetView style={{ paddingBottom: 24 }}>
        <Pressable
          onPress={handleReport}
          className="px-4 py-4 border-b border-divider"
        >
          <Text className="text-ink text-base">{reportLabel}</Text>
        </Pressable>
        <Pressable onPress={handleBlock} className="px-4 py-4">
          <Text style={{ color: DESTRUCTIVE }} className="text-base">
            {blockLabel}
          </Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

PostActionsSheet.displayName = "PostActionsSheet";

export default PostActionsSheet;
