import { useAddress, useMetamask, useAuth } from "@thirdweb-dev/react";
import type { NextPage } from "next";
import React from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

// Create our Supabase client using anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const Home: NextPage = () => {
  const router = useRouter();
  const auth = useAuth();
  const address = useAddress();
  const connect = useMetamask();
  const [user, setUser] = React.useState<any>();

  // Fetch the latest user data when we refresh the page
  React.useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser({
          id: user.id,
          email: user.email,
          address: user.user_metadata.address || "N/A",
        });
      }
    }

    getUser();
  }, []);

  // Sign in with google using Supabase auth
  async function signIn() {
    supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  // Sign out using Supabase auth
  async function signOut() {
    await supabase.auth.signOut();
    router.reload();
  }

  // Link verified wallet address to our Supabase account
  async function linkWallet() {
    const payload = await auth?.login();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    await fetch("/api/link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload, access_token: session?.access_token }),
    });

    router.reload();
  }

  return (
    <div>
      {user ? (
        <div>
          {address ? (
            <button onClick={() => linkWallet()}>Link Wallet to Account</button>
          ) : (
            <button onClick={() => connect()}>Connect Wallet</button>
          )}

          <button onClick={signOut}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={signIn}>Login with Google</button>
        </div>
      )}

      <div>
        <pre>User: {JSON.stringify(user || "N/A", undefined, 2)}</pre>
      </div>
    </div>
  );
};

export default Home;
