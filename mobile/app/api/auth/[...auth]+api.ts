import { createAuth } from "@acme/auth/better-auth";

const handler = createAuth(process.env.DATABASE_URL || "").handler;
export { handler as GET, handler as POST };
