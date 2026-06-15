export type ReactionKind = "reply" | "like";

export interface Reaction {
  kind: ReactionKind;
  count: number;
  active: boolean;
}

export interface User {
  pid: string;
  handle: string;
}

export interface ReactionCounts {
  reply: number;
  like: number;
}

export interface Post {
  id: string;
  authorPid: string;
  body: string;
  createdAt: string;
  reactions: ReactionCounts;
  removed?: boolean;
}

export interface TokenTransaction {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface Reply extends Post {
  postId: string;
}

export interface Report {
  id: string;
  reporterPid: string;
  postId: string;
  postAuthorPid: string;
  reason: string;
  createdAt: Date;
}

export type SurveyResponses = Record<string, string | number>;
