import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique identifier */
      id: string;
      /** The user's phone number */
      phoneNumber: string;
      /** The user's role (admin or user) */
      role: 'admin' | 'user';
      /** The user's status (active or suspended) */
      status: 'active' | 'suspended';
      /** The user's access token */
      accessToken: string;
    };
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    /** The user's unique identifier */
    id: string;
    /** The user's phone number */
    phoneNumber: string;
    /** The user's role (admin or user) */
    role: 'admin' | 'user';
    /** The user's status (active or suspended) */
    status: 'active' | 'suspended';
    /** The user's access token */
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** The user's unique identifier */
    id: string;
    /** The user's phone number */
    phoneNumber: string;
    /** The user's role (admin or user) */
    role: 'admin' | 'user';
    /** The user's status (active or suspended) */
    status: 'active' | 'suspended';
    /** The user's access token */
    accessToken: string;
  }
} 