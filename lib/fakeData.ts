import type { Post, Reply } from "../types";

export const FAKE_PIDS: string[] = [
  "PID-A1F-93K",
  "PID-B2G-44M",
  "PID-C3H-58N",
  "PID-D4I-71P",
  "PID-E5J-22Q",
  "PID-F6K-67R",
  "PID-G7L-04S",
  "PID-H8M-19T",
  "PID-I9N-83U",
  "PID-J0O-50V",
  "PID-K1P-77W",
  "PID-L2Q-31X",
];

const NOW = Date.now();
const minsAgo = (m: number) => new Date(NOW - m * 60_000).toISOString();

interface PostSeed {
  id: string;
  pidIdx: number;
  minsAgo: number;
  body: string;
  reactions: { reply: number; like: number };
}

const POST_SEEDS: PostSeed[] = [
  {
    id: "post-1",
    pidIdx: 0,
    minsAgo: 2,
    body: "If we want lower rents, we need to let people build more housing. Full stop. Zoning reform is the single policy lever that I've seen actually move the needle on rent in city-level data.",
    reactions: { reply: 1, like: 2 },
  },
  {
    id: "post-2",
    pidIdx: 1,
    minsAgo: 14,
    body: "Agreed.",
    reactions: { reply: 0, like: 1 },
  },
  {
    id: "post-3",
    pidIdx: 2,
    minsAgo: 38,
    body: "Single-payer would cut admin overhead, but the political coalition for it doesn't exist yet. A public option seems like a more realistic first step — let it compete with private plans and see what happens to premiums.",
    reactions: { reply: 3, like: 6 },
  },
  {
    id: "post-4",
    pidIdx: 3,
    minsAgo: 71,
    body: "Honest question: why is it controversial to tax capital gains at the same rate as wages? Two people each earn $100k — one from working a job, one from selling stock. Why does the wage earner pay more?",
    reactions: { reply: 5, like: 11 },
  },
  {
    id: "post-5",
    pidIdx: 4,
    minsAgo: 124,
    body: "Rent control sounds good in theory. In practice, landlords stop maintaining the building and new construction dries up because the math no longer works. We've run this experiment in three cities and the outcomes were not subtle.",
    reactions: { reply: 2, like: 3 },
  },
  {
    id: "post-6",
    pidIdx: 5,
    minsAgo: 200,
    body: "Drug pricing is the cleanest example of market failure I can think of. The end user can't shop around when they're sick or scared, the insurer's incentives aren't aligned with the patient's, the prescriber doesn't pay the price, and the manufacturer has a temporary monopoly via patent. None of the conditions that make markets work are present. Acknowledging that isn't ideological — it's just describing the structure of the market we actually have.",
    reactions: { reply: 5, like: 18 },
  },
  {
    id: "post-7",
    pidIdx: 6,
    minsAgo: 290,
    body: "We tried that already.",
    reactions: { reply: 1, like: 0 },
  },
  {
    id: "post-8",
    pidIdx: 7,
    minsAgo: 410,
    body: "The case for higher property taxes on undeveloped urban land (Henry George style) is genuinely the strongest tax-policy argument I've ever read. It taxes unproductive use of scarce land, and the supply curve doesn't move because land is fixed in quantity.",
    reactions: { reply: 2, like: 4 },
  },
  {
    id: "post-9",
    pidIdx: 8,
    minsAgo: 540,
    body: "I keep hearing \"just build more housing\" as if it's politically free. Try going to a planning meeting in any well-off neighborhood. The opposition is loud, organized, well-funded, and not going anywhere.",
    reactions: { reply: 6, like: 14 },
  },
  {
    id: "post-10",
    pidIdx: 9,
    minsAgo: 720,
    body: "Sales taxes are regressive and we know this. Yet they keep growing as a share of state revenue because they're politically easier than raising income taxes. We're slowly making the system worse on autopilot.",
    reactions: { reply: 0, like: 2 },
  },
  {
    id: "post-11",
    pidIdx: 10,
    minsAgo: 1100,
    body: "Hospital prices being completely opaque is wild. You can't get a quote for a routine procedure ahead of time. Try doing that in any other industry and see how the conversation goes.",
    reactions: { reply: 1, like: 5 },
  },
  {
    id: "post-12",
    pidIdx: 11,
    minsAgo: 1500,
    body: "Fair point on the wage/capital comparison, but capital is mobile and labor isn't. Tax it the same and a chunk of capital leaves. That isn't a rhetorical move — it's just how the tax base responds when you change the rate.",
    reactions: { reply: 3, like: 1 },
  },
  {
    id: "post-13",
    pidIdx: 0,
    minsAgo: 2200,
    body: "Mixed feelings on this.",
    reactions: { reply: 0, like: 0 },
  },
  {
    id: "post-14",
    pidIdx: 1,
    minsAgo: 3000,
    body: "There's a habit in these conversations of treating \"the market\" and \"the government\" as the only two options. Most working healthcare systems are a hybrid — heavily regulated private insurers, public reinsurance for catastrophic costs, and price negotiation through a single buyer for drugs. The dichotomy is mostly an American framing problem.",
    reactions: { reply: 4, like: 22 },
  },
  {
    id: "post-15",
    pidIdx: 2,
    minsAgo: 4200,
    body: "If your housing policy doesn't have a 5-year construction target attached to it, it isn't a policy. It's a vibe.",
    reactions: { reply: 7, like: 28 },
  },
];

export const FAKE_POSTS: Post[] = POST_SEEDS.map((s) => ({
  id: s.id,
  authorPid: FAKE_PIDS[s.pidIdx],
  body: s.body,
  createdAt: minsAgo(s.minsAgo),
  reactions: s.reactions,
}));

interface ReplySeed {
  id: string;
  pidIdx: number;
  minsAgo: number;
  body: string;
  reactions: { reply: number; like: number };
}

const REPLY_SEEDS: ReplySeed[] = [
  {
    id: "reply-1",
    pidIdx: 5,
    minsAgo: 65,
    body: "The mobility argument is real but overstated. Most US capital gains are realized by people who aren't actually relocating to Singapore. The marginal taxpayer at the very top is mobile; the median capital-gains taxpayer is a retiree selling stock.",
    reactions: { reply: 0, like: 4 },
  },
  {
    id: "reply-2",
    pidIdx: 7,
    minsAgo: 55,
    body: "Tax incidence isn't the same as the statutory rate, though. A lot of \"wage\" income at the top is already structured to look like capital gains via deferred comp, founder's shares, carried interest, etc.",
    reactions: { reply: 1, like: 3 },
  },
  {
    id: "reply-3",
    pidIdx: 9,
    minsAgo: 30,
    body: "Because they aren't the same thing economically. Capital was already taxed once at the corporate level — taxing it again at the personal level is double taxation.",
    reactions: { reply: 2, like: 1 },
  },
  {
    id: "reply-4",
    pidIdx: 11,
    minsAgo: 12,
    body: "I'd love to see this written up with real numbers rather than slogans. Both sides have strong-sounding arguments and nobody seems to be looking at the same data.",
    reactions: { reply: 0, like: 2 },
  },
  {
    id: "reply-5",
    pidIdx: 4,
    minsAgo: 4,
    body: "Worth noting that long-term gains rates were specifically designed to encourage long-horizon investment over speculation. Whether they actually achieve that is an empirical question I haven't seen settled.",
    reactions: { reply: 0, like: 0 },
  },
];

export const FAKE_REPLIES: Reply[] = REPLY_SEEDS.map((s) => ({
  id: s.id,
  postId: "post-4",
  authorPid: FAKE_PIDS[s.pidIdx],
  body: s.body,
  createdAt: minsAgo(s.minsAgo),
  reactions: s.reactions,
}));
