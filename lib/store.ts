import { create } from "zustand";
import type { Post, ReactionCounts, Reply, Report } from "../types";
import { FAKE_POSTS, FAKE_REPLIES } from "./fakeData";

export type ToggleableKind = "like";
export type ReactionKind = ToggleableKind | "reply";

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function reactionKey(id: string, kind: ToggleableKind): string {
  return `${id}:${kind}`;
}

function bumpCount(
  counts: ReactionCounts,
  kind: ToggleableKind,
  delta: number,
): ReactionCounts {
  return {
    ...counts,
    [kind]: Math.max(0, counts[kind] + delta),
  };
}

interface StoreState {
  posts: Post[];
  replies: Reply[];
  reports: Report[];
  blockedPids: Set<string>;
  pid: string | null;
  reactionsByUser: Set<string>;

  setPid: (pid: string | null) => void;
  resetUserState: () => void;
  addPost: (body: string) => void;
  addReply: (postId: string, body: string) => void;
  deletePost: (id: string) => void;
  deleteReply: (id: string) => void;
  toggleReaction: (id: string, kind: ToggleableKind) => void;
  addReport: (postId: string, postAuthorPid: string, reason: string) => void;
  blockUser: (pid: string) => void;
  unblockUser: (pid: string) => void;
  isBlocked: (pid: string) => boolean;
}

export const useStore = create<StoreState>((set, get) => ({
  posts: FAKE_POSTS,
  replies: FAKE_REPLIES,
  reports: [],
  blockedPids: new Set<string>(),
  pid: null,
  reactionsByUser: new Set<string>(),

  setPid: (pid) => set({ pid }),

  resetUserState: () =>
    set({
      pid: null,
      reactionsByUser: new Set<string>(),
      blockedPids: new Set<string>(),
      reports: [],
    }),

  addPost: (body) =>
    set((state) => {
      if (!state.pid) return state;
      const newPost: Post = {
        id: uid(),
        authorPid: state.pid,
        body,
        createdAt: new Date().toISOString(),
        reactions: { reply: 0, like: 0 },
      };
      return { posts: [newPost, ...state.posts] };
    }),

  addReply: (postId, body) =>
    set((state) => {
      if (!state.pid) return state;
      const newReply: Reply = {
        id: uid(),
        postId,
        authorPid: state.pid,
        body,
        createdAt: new Date().toISOString(),
        reactions: { reply: 0, like: 0 },
      };
      const posts = state.posts.map((p) =>
        p.id === postId
          ? { ...p, reactions: { ...p.reactions, reply: p.reactions.reply + 1 } }
          : p,
      );
      return { replies: [...state.replies, newReply], posts };
    }),

  deletePost: (id) =>
    set((state) => ({ posts: state.posts.filter((p) => p.id !== id) })),

  deleteReply: (id) =>
    set((state) => {
      const reply = state.replies.find((r) => r.id === id);
      if (!reply) return state;
      const replies = state.replies.filter((r) => r.id !== id);
      const posts = state.posts.map((p) =>
        p.id === reply.postId
          ? {
              ...p,
              reactions: {
                ...p.reactions,
                reply: Math.max(0, p.reactions.reply - 1),
              },
            }
          : p,
      );
      return { replies, posts };
    }),

  toggleReaction: (id, kind) =>
    set((state) => {
      const key = reactionKey(id, kind);
      const wasActive = state.reactionsByUser.has(key);
      const nextSet = new Set(state.reactionsByUser);
      if (wasActive) nextSet.delete(key);
      else nextSet.add(key);
      const delta = wasActive ? -1 : 1;
      const posts = state.posts.map((p) =>
        p.id === id ? { ...p, reactions: bumpCount(p.reactions, kind, delta) } : p,
      );
      const replies = state.replies.map((r) =>
        r.id === id ? { ...r, reactions: bumpCount(r.reactions, kind, delta) } : r,
      );
      return { reactionsByUser: nextSet, posts, replies };
    }),

  addReport: (postId, postAuthorPid, reason) =>
    set((state) => {
      if (!state.pid) return state;
      const report: Report = {
        id: uid(),
        reporterPid: state.pid,
        postId,
        postAuthorPid,
        reason,
        createdAt: new Date(),
      };
      return { reports: [...state.reports, report] };
    }),

  blockUser: (pid) =>
    set((state) => {
      const next = new Set(state.blockedPids);
      next.add(pid);
      return { blockedPids: next };
    }),

  unblockUser: (pid) =>
    set((state) => {
      const next = new Set(state.blockedPids);
      next.delete(pid);
      return { blockedPids: next };
    }),

  isBlocked: (pid) => get().blockedPids.has(pid),
}));

export function selectIsActive(id: string, kind: ToggleableKind) {
  return (s: StoreState) => s.reactionsByUser.has(reactionKey(id, kind));
}
