import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, format } from "date-fns";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../App";
import { STARTING_BALANCE, TOKEN_COSTS, TOKEN_REWARDS, useStore } from "../lib/store";
import type { TokenTransaction } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Wallet">;

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const secs = differenceInSeconds(now, d);
  if (secs < 60) return "just now";
  const mins = differenceInMinutes(now, d);
  if (mins < 60) return `${mins}m ago`;
  const hours = differenceInHours(now, d);
  if (hours < 24) return `${hours}h ago`;
  const days = differenceInDays(now, d);
  if (days < 7) return `${days}d ago`;
  return format(d, "MMM d");
}

function TransactionRow({ tx }: { tx: TokenTransaction }) {
  const isEarn = tx.amount > 0;
  return (
    <View className="flex-row items-center px-4 py-3 border-b border-divider">
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: isEarn ? "#E8F5E9" : "#FFF3E0",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Text style={{ fontSize: 16 }}>{isEarn ? "＋" : "－"}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-ink text-sm font-medium">{tx.reason}</Text>
        <Text className="text-muted text-xs mt-0.5">{relativeTime(tx.createdAt)}</Text>
      </View>
      <Text
        style={{
          fontWeight: "700",
          fontSize: 15,
          color: isEarn ? "#2E7D32" : "#E65100",
        }}
      >
        {isEarn ? "+" : ""}
        {tx.amount}
      </Text>
    </View>
  );
}

export default function WalletScreen(_: Props) {
  const tokenBalance = useStore((s) => s.tokenBalance);
  const transactions = useStore((s) => s.transactions);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["bottom", "left", "right"]}>
      <View
        className="items-center py-8 border-b border-divider"
        style={{ backgroundColor: "#1D9BF0" }}
      >
        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "600", letterSpacing: 1 }}>
          TOKEN BALANCE
        </Text>
        <Text style={{ color: "#fff", fontSize: 56, fontWeight: "800", lineHeight: 68 }}>
          {tokenBalance}
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
          Started with {STARTING_BALANCE}
        </Text>
      </View>

      <View className="flex-row px-4 py-3 border-b border-divider">
        <View className="flex-1">
          <Text className="text-muted text-xs font-semibold mb-1">EARN</Text>
          <Text className="text-ink text-xs">+{TOKEN_REWARDS.LOGIN} login</Text>
          <Text className="text-ink text-xs">+{TOKEN_REWARDS.POST} post</Text>
          <Text className="text-ink text-xs">+{TOKEN_REWARDS.REPLY} reply</Text>
          <Text className="text-ink text-xs">+{TOKEN_REWARDS.LIKE} like</Text>
        </View>
        <View className="flex-1">
          <Text className="text-muted text-xs font-semibold mb-1">SPEND</Text>
          <Text className="text-ink text-xs">−{TOKEN_COSTS.DELETE_POST} remove post</Text>
          <Text className="text-ink text-xs">−{TOKEN_COSTS.DELETE_REPLY} remove reply</Text>
          <Text className="text-ink text-xs">−{TOKEN_COSTS.BLOCK_USER} block user</Text>
          <Text className="text-ink text-xs">−{TOKEN_COSTS.REPORT} punish user</Text>
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => <TransactionRow tx={item} />}
        ListEmptyComponent={
          <Text className="text-muted text-center mt-12">
            No activity yet. Start participating to earn tokens.
          </Text>
        }
        contentContainerStyle={transactions.length === 0 ? { flex: 1 } : undefined}
      />
    </SafeAreaView>
  );
}
