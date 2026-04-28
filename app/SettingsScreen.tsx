import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import type { RootStackParamList } from "../App";
import Avatar from "../components/Avatar";
import { getHandleFromPid } from "../lib/anonymize";
import { useStore } from "../lib/store";

export default function SettingsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const blockedPids = useStore((s) => s.blockedPids);
  const unblockUser = useStore((s) => s.unblockUser);

  const blockedList = useMemo(() => Array.from(blockedPids), [blockedPids]);

  return (
    <View className="flex-1 bg-bg">
      <View className="px-4 pt-5 pb-2">
        <Text className="text-muted text-xs font-bold uppercase tracking-wider">
          Blocked users
        </Text>
      </View>
      {blockedList.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-muted">You haven't blocked anyone.</Text>
        </View>
      ) : (
        <FlatList
          data={blockedList}
          keyExtractor={(pid) => pid}
          renderItem={({ item: pid }) => {
            const handle = getHandleFromPid(pid);
            return (
              <View className="flex-row items-center bg-bg px-4 py-3 border-b border-divider">
                <Pressable
                  onPress={() => navigation.navigate("Profile", { pid })}
                  hitSlop={6}
                  className="flex-row items-center flex-1"
                >
                  <Avatar pid={pid} size={36} />
                  <Text className="text-ink font-bold ml-3" numberOfLines={1}>
                    {handle}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => unblockUser(pid)}
                  className="border border-divider rounded-full px-4 py-1.5"
                >
                  <Text className="text-ink font-bold text-sm">Unblock</Text>
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
