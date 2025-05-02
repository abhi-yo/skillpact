import type { DefaultSession, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * Module augmentation for `next-auth` types.
 * Allows us to add custom properties to the `session` object
 * and keep type safety.
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string; // Add the id field
      // Include other default fields if needed, or just extend DefaultSession['user']
    } & DefaultSession["user"]; // Merge with default user fields (name, email, image)
  }

  // If using JWT strategy, you might also want to extend the User type
  // interface User {
  //   // Add your custom fields here, e.g.:
  //   // role: UserRole;
  // }
}

// If using JWT strategy, augment the JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    // Add other custom fields from your JWT callback
  }
} 