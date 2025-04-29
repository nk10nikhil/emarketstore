import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/config";

// Create and export the handler using the imported authOptions
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
