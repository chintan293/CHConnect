import { AuthActionPanel } from "../components/auth/AuthActionPanel";
import  AuthHeader  from "../components/auth/AuthHeader";
import { AuthHeroPanel }  from "../components/auth/AuthHeroPanel";

function AuthPage() {

  return (
    <div className="box-border flex min-h-dvh flex-col">
      <div className="flex w-full flex-1 flex-col overflow-hidden bg-background text-foreground">
        <AuthHeader />

        <main className="relative flex flex-1 flex-col overflow-hidden md:flex-row">
          <AuthHeroPanel />
          <AuthActionPanel />
        </main>
      </div>
    </div>
  );
}

export default AuthPage;
