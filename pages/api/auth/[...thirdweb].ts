import { ThirdwebAuth } from "@thirdweb-dev/auth/next";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || "", 
  process.env.SUPABASE_KEY || ""
);

export const { ThirdwebAuthHandler, getUser } = ThirdwebAuth({
  privateKey: process.env.ADMIN_PRIVATE_KEY || "",
  domain: "localhost:3000",
  callbacks: {
    login: async (address: string) => {
      const { data: user } = 
        await supabase
          .from("user")
          .select("*")
          .eq("address", address)
          .single();

      if (!user) {
        await supabase
          .from('users')
          .insert({ address })
          .single();
      }
    },
    user: async (address: string) => {
      const { data: user } = 
        await supabase
          .from("user")
          .select("*")
          .eq("address", address)
          .single();

      return { ...user };
    },
  }
});

export default ThirdwebAuthHandler();