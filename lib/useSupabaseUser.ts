import { Session, User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { createSupabaseClient } from "./createSupabase";

interface CustomUser {
  id: User["id"];
  email: User["email"];
  address: string;
}

// Helpful hook for you to get the currently authenticated user
export default function useSupabaseUser() {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { auth } = createSupabaseClient();

  const refreshUser = useCallback(async () => {
    const {
      data: { user },
    } = await auth.getUser();
    setUser(
      user
        ? {
            id: user.id,
            email: user.email,
            address: user.user_metadata.address || "N/A",
          }
        : null
    );

    const {
      data: { session },
    } = await auth.getSession();
    setSession(session ?? null);
    setIsLoading(false);
  }, [auth]);

  useEffect(() => {
    const {
      data: { subscription },
    } = auth.onAuthStateChange(async (event, session) => {
      refreshUser();
    });

    refreshUser();

    return () => {
      subscription.unsubscribe();
    };
  }, [auth]);

  return { isLoading, user, session, refresh: refreshUser };
}
