import type { NextPage } from "next";
import { useAddress, useMetamask, useAuth } from "@thirdweb-dev/react";
import { createSupabaseClient } from "../lib/createSupabase";
import useSupabaseUser from "../lib/useSupabaseUser";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const thirdwebAuth = useAuth();
  const address = useAddress();
  const connect = useMetamask();
  const { auth } = createSupabaseClient();
  const { user, session, refresh, isLoading } = useSupabaseUser();

  // Link verified wallet address to our Supabase account
  async function linkWallet() {
    const payload = await thirdwebAuth?.login();
    await fetch("/api/link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload, access_token: session?.access_token }),
    });
    refresh();
  }

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.iconContainer}>
          <img
            className={styles.icon}
            src={"/thirdweb.png"}
            alt="thirdweb icon"
          />
          <img
            className={styles.icon}
            src={"/supabase.png"}
            alt="supabase icon"
          />
        </div>

        <h1 className={styles.h1}>thirdweb + Supabase</h1>

        <p className={styles.explain}>
          In this flow, you'll be able to login to Supabase Auth with your
          email, and then verifiably link you're wallet address to the created
          account.
        </p>

        <div>
          {user ? (
            <div className={styles.stack}>
              {address ? (
                <button
                  onClick={() => linkWallet()}
                  className={styles.mainButton}
                >
                  Link Wallet to Account
                </button>
              ) : (
                <button onClick={() => connect()} className={styles.mainButton}>
                  Connect Wallet
                </button>
              )}

              <button
                onClick={() => auth.signOut()}
                className={styles.mainButton}
              >
                Logout
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={() =>
                  auth.signInWithOAuth({
                    provider: "google",
                  })
                }
                className={styles.mainButton}
              >
                Login with Google
              </button>
            </div>
          )}

          <hr className={styles.divider} />

          <h2>Current User Information</h2>

          <p>
            <b>Connected Wallet: </b>
            {address}
          </p>

          <p>
            <b>User ID: </b>
            {isLoading ? "Loading..." : user?.id || "N/A"}
          </p>

          <p>
            <b>User Email: </b>
            {isLoading ? "Loading..." : user?.email || "N/A"}
          </p>

          <p>
            <b>User Address: </b>
            {isLoading ? "Loading..." : user?.address || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
