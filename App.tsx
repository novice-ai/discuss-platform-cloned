import "./global.css";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ComposeScreen from "./app/ComposeScreen";
import FeedScreen from "./app/FeedScreen";
import LoginScreen from "./app/LoginScreen";
import PostDetailScreen from "./app/PostDetailScreen";
import ProfileScreen from "./app/ProfileScreen";
import ReportScreen from "./app/ReportScreen";
import SettingsScreen from "./app/SettingsScreen";
import { getPid } from "./lib/storage";
import { useStore } from "./lib/store";
import type { Post, Reply } from "./types";

export type RootStackParamList = {
  Login: undefined;
  Feed: undefined;
  PostDetail: { post: Post };
  Profile: { pid: string };
  Compose: undefined;
  Report: { item: Post | Reply; isReply: boolean };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    getPid().then((pid) => {
      if (pid) useStore.getState().setPid(pid);
      setInitialRoute(pid ? "Feed" : "Login");
    });
  }, []);

  if (!initialRoute) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <BottomSheetModalProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={initialRoute}
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Feed" component={FeedScreen} />
              <Stack.Screen
                name="PostDetail"
                component={PostDetailScreen}
                options={{ headerShown: true, title: "Post" }}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: true, title: "Profile" }}
              />
              <Stack.Screen
                name="Compose"
                component={ComposeScreen}
                options={{ presentation: "modal", headerShown: false }}
              />
              <Stack.Screen
                name="Report"
                component={ReportScreen}
                options={{ presentation: "modal", headerShown: false }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ headerShown: true, title: "Settings" }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
