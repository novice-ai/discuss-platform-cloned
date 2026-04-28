function djb2(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

function hashHex4(pid: string): string {
  return djb2(pid).toString(16).padStart(8, "0").slice(-4).toUpperCase();
}

export function getHandleFromPid(pid: string): string {
  return `Member ${hashHex4(pid)}`;
}

export function getShortIdFromPid(pid: string): string {
  return hashHex4(pid);
}

const AVATAR_PALETTE = [
  "#1D9BF0",
  "#00BA7C",
  "#F91880",
  "#7856FF",
  "#FFAD1F",
  "#E8290B",
  "#26A69A",
  "#5B6CFF",
];

export function getAvatarColorFromPid(pid: string): string {
  return AVATAR_PALETTE[djb2(pid) % AVATAR_PALETTE.length];
}
