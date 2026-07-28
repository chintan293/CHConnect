import { WallpaperProvider } from "./context/WallpaperContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage.jsx";
import AuthPage from "./pages/AuthPage.jsx"; 
import { useAuth } from "@clerk/react"; 

function App() {

  const { isSignedIn, isLoaded } = useAuth();

  //todo: make this a better component
  if(!isLoaded) return <p>loading...</p>;

  return (
      <ThemeProvider>
        <WallpaperProvider>
          <Routes>
            <Route 
              path="/" 
              element={isSignedIn ? <ChatPage /> : <Navigate to={"/auth"} replace />} />
            <Route 
              path="/auth" 
              element={!isSignedIn ? <AuthPage /> : <Navigate to={"/chat"} replace />} />

          </Routes>
        </WallpaperProvider>
      </ThemeProvider>
  );
}

export default App;
