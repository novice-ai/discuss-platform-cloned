# Agora — Discussion Platform (Frontend)

A Twitter-style discussion app built for an upcoming moderation research experiment. This repo is the **mobile client only** — there is no backend yet. All data is in-memory and resets on app restart.

The platform will eventually host Prolific participants in randomized groups under controlled moderation conditions; right now it's a working visual + UX prototype on iOS and Android via Expo Go.

## Stack

- Expo SDK 54 (RN 0.81, React 19.1) + TypeScript
- React Navigation (native stack) — no Expo Router
- NativeWind v4 for styling
- Zustand for in-memory state
- `expo-secure-store` for PID persistence across launches
- `@gorhom/bottom-sheet` v5 for action menus
- `lucide-react-native` for icons, `date-fns` for relative timestamps

## Run locally

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (iPhone Camera or Expo Go's scanner on Android). On first run, paste anything as your "Prolific ID" — it's stored in SecureStore and used to derive your `Member XXXX` handle.

If anything looks stale after a config change: `npx expo start --clear` and **force-quit Expo Go on the device** before re-scanning. A reload is not enough when babel/native modules change.

## Project layout

```
App.tsx                  Providers + nav + initial-route logic
index.ts                 Expo entry
global.css               Tailwind directives
tailwind.config.js       Theme (bg/ink/muted/divider/brand/like)
babel.config.js          babel-preset-expo (auto-handles worklets) + nativewind/babel
metro.config.js          withNativeWind wrapper

app/
  LoginScreen.tsx        PID input → SecureStore → Feed
  FeedScreen.tsx         Header + post list + FAB + Settings/Logout
  PostDetailScreen.tsx   Original post + inline reply box + replies (chronological)
  ProfileScreen.tsx      Avatar + handle + stats + authored posts/replies; header three-dots → Block
  ComposeScreen.tsx      Modal: Cancel/Post header + ComposeBox
  ReportScreen.tsx       Modal: post preview + reason input (≥10 chars) → addReport
  SettingsScreen.tsx     Blocked users list with Unblock buttons

components/
  PostCard.tsx           Flat row: Avatar, handle, time, body, ReactionBar, three-dots
  ComposeBox.tsx         Auto-growing textarea, char counter, optional submit button
  ReactionBar.tsx        Reply (nav) + Like (toggle), lucide icons
  Avatar.tsx             Deterministic colored circle with last-2-hex initials
  PostActionsSheet.tsx   Bottom sheet with Report + Block (forwardRef + imperative open())

lib/
  store.ts               Zustand: posts, replies, reports, blockedPids, pid, reactionsByUser
  storage.ts             SecureStore wrappers (key: "pid")
  anonymize.ts           djb2 → 4-hex Member handle + deterministic avatar palette
  fakeData.ts            15 seeded posts, 5 seeded replies (all attached to post-4)

types/index.ts           Post, Reply, User, Reaction, ReactionCounts, Report
```

## What works

- **Auth**: PID stored in SecureStore. Cold start with stored PID → Feed; without → Login. Logout clears SecureStore + in-memory state.
- **Feed**: 15 seeded posts, reverse-chronological, with relative timestamps that update at render time.
- **Compose**: FAB (bottom-right) opens a modal. New posts prepend to the feed with the user's anonymized handle and `now` timestamp.
- **Reactions**: Like toggles on/off and persists per-user across screens for the session. Reply icon navigates to PostDetail.
- **Replies**: Inline compose box on PostDetail. New replies append at the bottom of the chronological list and bump the parent's reply count.
- **Profile**: Tap any avatar or handle → Profile shows that user's posts and replies merged in time order. Replies prefixed with `Replying to {handle}`.
- **Three-dots actions** (on every post/reply):
  - Own item → Alert confirmation → Delete (decrements parent reply count if applicable).
  - Other user's → Bottom sheet with `Report post/reply` and `Block @MemberXXXX`.
- **Reporting**: Modal with read-only post preview (60% opacity), required reason ≥10 chars, capped at 500. Submit writes to `store.reports` (in-memory only).
- **Blocking**: Confirm-Alert → adds PID to `blockedPids` Set. Filtering applied in Feed (posts), PostDetail (replies), and Profile (full-screen blocked placeholder with Unblock).
- **Settings**: Blocked users list, immediate Unblock, tap-to-Profile. Accessed via the gear icon in the Feed header.

## Not yet built (intentionally)

- Backend (Postgres, API routes, real auth, real moderation pipeline)
- Survey screens (baseline + endline)
- Daily digest via Prolific bulk messaging
- Push notifications
- Anything that requires App Store / TestFlight distribution

State does **not** persist across app restarts. That's the design — the next pass wires Zustand to a backend.

## Version pinning notes (read before changing native deps)

Expo Go SDK 54 ships with prebuilt native modules at specific versions. The JS-side packages **must** match those exact versions or the JSI bridge throws `Exception in HostFunction: <unknown>` at module-load time. `npx expo install --check` only validates direct dependency ranges, **not** transitive ones — so `react-native-worklets` is the trap.

The reference list lives at `node_modules/expo/bundledNativeModules.json`. As of SDK 54:

| Package                          | Pinned to       | Why                                                              |
| -------------------------------- | --------------- | ---------------------------------------------------------------- |
| `react-native-reanimated`        | `4.1.1` (exact) | Pairs with worklets 0.5.x in Expo Go                             |
| `react-native-worklets`          | `0.5.1` (exact) | Newer minors (0.8.x) silently break JSI bindings                 |
| `babel-preset-expo`              | `~54.0.10`      | v55 (next-SDK) auto-injects an incompatible worklets transform   |
| `react-native-gesture-handler`   | `~2.28.0`       | Required by `@gorhom/bottom-sheet` v5                            |

Don't add `react-native-worklets/plugin` to `babel.config.js` manually — `babel-preset-expo@54` already auto-injects it when reanimated is detected. Adding it twice corrupts the worklet output.

## Known gotchas

- **Bottom sheet content must be wrapped in `BottomSheetView`**, not a plain RN `View`. Otherwise the sheet "presents" but renders at zero height. We learned this the hard way; see `components/PostActionsSheet.tsx`.
- **New architecture is enabled** (`app.json: newArchEnabled: true`). Reanimated 4 requires it.
- **NativeWind className+style ordering**: Tailwind classes apply *after* inline `style` props in NativeWind v4. Use `style={{...}}` for shadow/elevation (cross-platform), `className` for everything else.
- **Pressable nesting works as expected**: tapping an inner Pressable does not trigger the outer Pressable's `onPress`. Used throughout for tappable handles inside row-tap-to-detail layouts.

## License

See `LICENSE`.
