import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
});

export async function getAuthToken(): Promise<string | null> {
  try {
    const session = await authClient.getSession();
    return session.data?.session?.token ?? null;
  } catch (error) {
    console.error("Failed to get auth token:", error);
    return null;
  }
}
