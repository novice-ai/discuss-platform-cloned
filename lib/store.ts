import { create } from "zustand";
import type { Post, ReactionCounts, Reply, Report, SurveyResponses, TokenTransaction } from "../types";
import { FAKE_POSTS, FAKE_REPLIES } from "./fakeData";

export type ToggleableKind = "like";
export type ReactionKind = ToggleableKind | "reply";

// Token economy constants — exported so UI can show costs in alerts
export const TOKEN_REWARDS = {
  LOGIN: 10,
  POST: 5,
  REPLY: 3,
  LIKE: 1,
} as const;

export const TOKEN_COSTS = {
  DELETE_POST: 20,
  DELETE_REPLY: 10,
  BLOCK_USER: 15,
  REPORT: 10,
} as const;

export const STARTING_BALANCE = 100;

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
  return { ...counts, [kind]: Math.max(0, counts[kind] + delta) };
}

function makeTx(amount: number, reason: string): TokenTransaction {
  return { id: uid(), amount, reason, createdAt: new Date().toISOString() };
}

interface StoreState {
  posts: Post[];
  replies: Reply[];
  reports: Report[];
  blockedPids: Set<string>;
  pid: string | null;
  reactionsByUser: Set<string>;
  baselineResponses: SurveyResponses | null;
  endlineResponses: SurveyResponses | null;
  tokenBalance: number;
  transactions: TokenTransaction[];

  setPid: (pid: string | null) => void;
  resetUserState: () => void;
  submitBaseline: (responses: SurveyResponses) => void;
  submitEndline: (responses: SurveyResponses) => void;
  addPost: (body: string) => void;
  addReply: (postId: string, body: string) => void;
  deletePost: (id: string) => void;
  deleteReply: (id: string) => void;
  toggleReaction: (id: string, kind: ToggleableKind) => void;
  addReport: (postId: string, postAuthorPid: string, reason: string) => boolean;
  blockUser: (pid: string) => boolean;
  unblockUser: (pid: string) => void;
  isBlocked: (pid: string) => boolean;
  canAfford: (amount: number) => boolean;
  moderatePost: (id: string) => void;
  moderateReply: (id: string) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  posts: FAKE_POSTS,
  replies: FAKE_REPLIES,
  reports: [],
  blockedPids: new Set<string>(),
  pid: null,
  reactionsByUser: new Set<string>(),
  baselineResponses: null,
  endlineResponses: null,
  tokenBalance: STARTING_BALANCE,
  transactions: [],

  setPid: (pid) => {
    if (!pid) { set({ pid }); return; }
    const tx = makeTx(TOKEN_REWARDS.LOGIN, "Logged in");
    set((state) => ({
      pid,
      tokenBalance: state.tokenBalance + TOKEN_REWARDS.LOGIN,
      transactions: [tx, ...state.transactions],
    }));
  },

  resetUserState: () =>
    set({
      pid: null,
      reactionsByUser: new Set<string>(),
      blockedPids: new Set<string>(),
      reports: [],
      baselineResponses: null,
      endlineResponses: null,
      tokenBalance: STARTING_BALANCE,
      transactions: [],
    }),

  submitBaseline: (responses) => set({ baselineResponses: responses }),
  submitEndline: (responses) => set({ endlineResponses: responses }),

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
      const tx = makeTx(TOKEN_REWARDS.POST, "Posted a message");
      return {
        posts: [newPost, ...state.posts],
        tokenBalance: state.tokenBalance + TOKEN_REWARDS.POST,
        transactions: [tx, ...state.transactions],
      };
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
      const tx = makeTx(TOKEN_REWARDS.REPLY, "Replied to a post");
      return {
        replies: [...state.replies, newReply],
        posts,
        tokenBalance: state.tokenBalance + TOKEN_REWARDS.REPLY,
        transactions: [tx, ...state.transactions],
      };
    }),

  deletePost: (id) =>
    set((state) => {
      if (state.tokenBalance < TOKEN_COSTS.DELETE_POST) return state;
      const tx = makeTx(-TOKEN_COSTS.DELETE_POST, "Removed a post");
      return {
        posts: state.posts.filter((p) => p.id !== id),
        tokenBalance: state.tokenBalance - TOKEN_COSTS.DELETE_POST,
        transactions: [tx, ...state.transactions],
      };
    }),

  deleteReply: (id) =>
    set((state) => {
      if (state.tokenBalance < TOKEN_COSTS.DELETE_REPLY) return state;
      const reply = state.replies.find((r) => r.id === id);
      if (!reply) return state;
      const replies = state.replies.filter((r) => r.id !== id);
      const posts = state.posts.map((p) =>
        p.id === reply.postId
          ? { ...p, reactions: { ...p.reactions, reply: Math.max(0, p.reactions.reply - 1) } }
          : p,
      );
      const tx = makeTx(-TOKEN_COSTS.DELETE_REPLY, "Removed a reply");
      return {
        replies,
        posts,
        tokenBalance: state.tokenBalance - TOKEN_COSTS.DELETE_REPLY,
        transactions: [tx, ...state.transactions],
      };
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
      // Only earn tokens on like, not unlike
      if (!wasActive && kind === "like") {
        const tx = makeTx(TOKEN_REWARDS.LIKE, "Liked a post");
        return {
          reactionsByUser: nextSet, posts, replies,
          tokenBalance: state.tokenBalance + TOKEN_REWARDS.LIKE,
          transactions: [tx, ...state.transactions],
        };
      }
      return { reactionsByUser: nextSet, posts, replies };
    }),

  addReport: (postId, postAuthorPid, reason) => {
    const state = get();
    if (!state.pid || state.tokenBalance < TOKEN_COSTS.REPORT) return false;
    const report: Report = {
      id: uid(),
      reporterPid: state.pid,
      postId,
      postAuthorPid,
      reason,
      createdAt: new Date(),
    };
    const tx = makeTx(-TOKEN_COSTS.REPORT, "Reported a post");
    set((s) => ({
      reports: [...s.reports, report],
      tokenBalance: s.tokenBalance - TOKEN_COSTS.REPORT,
      transactions: [tx, ...s.transactions],
    }));
    return true;
  },

  blockUser: (pid) => {
    const state = get();
    if (state.tokenBalance < TOKEN_COSTS.BLOCK_USER) return false;
    const tx = makeTx(-TOKEN_COSTS.BLOCK_USER, `Blocked a member`);
    set((s) => {
      const next = new Set(s.blockedPids);
      next.add(pid);
      return {
        blockedPids: next,
        tokenBalance: s.tokenBalance - TOKEN_COSTS.BLOCK_USER,
        transactions: [tx, ...s.transactions],
      };
    });
    return true;
  },

  unblockUser: (pid) =>
    set((state) => {
      const next = new Set(state.blockedPids);
      next.delete(pid);
      return { blockedPids: next };
    }),

  isBlocked: (pid) => get().blockedPids.has(pid),
  canAfford: (amount) => get().tokenBalance >= amount,

  moderatePost: (id) =>
    set((state) => ({
      posts: state.posts.map((p) => p.id === id ? { ...p, removed: true } : p),
    })),

  moderateReply: (id) =>
    set((state) => ({
      replies: state.replies.map((r) => r.id === id ? { ...r, removed: true } : r),
    })),
}));

export function selectIsActive(id: string, kind: ToggleableKind) {
  return (s: StoreState) => s.reactionsByUser.has(reactionKey(id, kind));
}
