// WallpaperProvider removed
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import { useAuth } from "@clerk/react";
import PageLoader from "./components/PageLoader.jsx";
import { useAuthStore } from "./store/useAuthStore.js";
import { useChatStore } from "./store/useChatStore.js";
import { useEffect } from "react";

import { Toaster } from "react-hot-toast";

function App() {

  const { isSignedIn, isLoaded, getToken } = useAuth();

  //option 1
  //const { checkAuth, isCheckingAuth, clearAuth } = useAuthStore();

  //option 2 - better for performance
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      checkAuth(getToken);
      useChatStore.getState().initGlobalListener();
    } else {
      clearAuth();
      useChatStore.getState().cleanupGlobalListener();
    }

    return () => {
      useChatStore.getState().cleanupGlobalListener();
    };
  }, [checkAuth, clearAuth, isLoaded, isSignedIn, getToken]);

  if (!isLoaded || (isSignedIn && isCheckingAuth)) return <PageLoader />;

  return (
    <ThemeProvider>
      <Routes>
        <Route
          path="/"
          element={isSignedIn ? <ChatPage /> : <Navigate to={"/auth"} replace />} />
        <Route
          path="/auth"
          element={!isSignedIn ? <AuthPage /> : <Navigate to={"/"} replace />} />

      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
