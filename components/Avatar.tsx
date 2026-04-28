import { Text, View } from "react-native";
import { getAvatarColorFromPid, getShortIdFromPid } from "../lib/anonymize";

interface AvatarProps {
  pid: string;
  size?: number;
}

export default function Avatar({ pid, size = 36 }: AvatarProps) {
  const initials = getShortIdFromPid(pid).slice(-2);
  const bg = getAvatarColorFromPid(pid);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
      }}
      className="items-center justify-center"
    >
      <Text
        className="text-white font-bold"
        style={{ fontSize: size * 0.4 }}
      >
        {initials}
      </Text>
    </View>
  );
}
