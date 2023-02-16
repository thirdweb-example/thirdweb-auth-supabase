import { NextApiRequest, NextApiResponse } from "next";
import { verifyLogin } from "@thirdweb-dev/auth/evm";
import { createClient } from "@supabase/supabase-js";

// Create a Supabase client using the service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE as string
);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { payload, access_token } = req.body;

  // Get the user from our database using the client side access token
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser(access_token);
  if (!user) {
    return res.status(400).json({ error: userErr });
  }

  // Verify that the signed login payload is valid
  const { address, error: verifyErr } = await verifyLogin(
    process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN as string,
    payload
  );
  if (!address) {
    return res.status(400).json({ error: verifyErr });
  }

  // Update the user's address in our database
  const { error: updateErr } = await supabase.auth.admin.updateUserById(
    user.id,
    {
      user_metadata: { address: address.toLowerCase() },
    }
  );
  if (updateErr) {
    return res.status(400).json({ error: updateErr });
  }

  return res.status(200).end();
};
