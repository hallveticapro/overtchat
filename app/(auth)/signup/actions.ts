"use server";

import { count } from "drizzle-orm";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { user } from "@/lib/db/schema";

export async function bootstrapSignUp(input: {
  email: string;
  password: string;
}): Promise<{ error?: string }> {
  const [{ n }] = await db.select({ n: count() }).from(user);
  if (n > 0) return { error: "Signup is closed." };

  try {
    await auth.api.signUpEmail({
      body: {
        email: input.email,
        password: input.password,
        name: input.email,
      },
    });
    return {};
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: message };
  }
}
