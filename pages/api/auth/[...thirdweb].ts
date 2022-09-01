import { ThirdwebAuth } from "@thirdweb-dev/auth/next";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || "", 
  process.env.SUPABASE_SERVICE_ROLE || ""
);

export const { ThirdwebAuthHandler, getUser } = ThirdwebAuth({
  privateKey: process.env.ADMIN_PRIVATE_KEY || "",
  domain: "localhost:3000",
  callbacks: {
    login: async (address: string) => {
      const { data: user } = 
        await supabase
          .from("users")
          .select("*")
          .eq("address", address.toLowerCase())
          .single()

      if (!user) {
        const res = await supabase
          .from('users')
          .insert({ address: address.toLowerCase() })
          .single();
        
        if (res.error) {
          throw new Error("Failed to create user!")
        }
      }
    },
    user: async (address: string) => {
      const { data: user } = 
        await supabase
          .from("users")
          .select("*")
          .eq("address", address.toLowerCase())
          .single()

      return user;
    },
  }
});

export default ThirdwebAuthHandler();