declare module "#auth-utils" {
  interface User {
    // Add your own fields
    name: string;
    email: string;
    avatar: string;
  }

  interface UserSession {
    // Add your own fields
  }

  interface SecureSessionData {
    // Add your own fields
  }
}

export {};
