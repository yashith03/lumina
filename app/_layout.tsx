import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { AuthProvider } from "../src/hooks/useAuth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor:
                colorScheme === "dark" ? "#111827" : "#ffffff",
            },
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="reading/[bookId]" />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
