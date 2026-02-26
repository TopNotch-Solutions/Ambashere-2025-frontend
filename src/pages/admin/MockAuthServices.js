// Mock authentication service
export const MockAuthService = {
    isLoggedIn: false,
    login: () => {
      MockAuthService.isLoggedIn = true;
      // Simulate a user ID retrieved after login
      return "EKAVE01"; // Mock user ID
    },
    logout: () => {
      MockAuthService.isLoggedIn = false;
    },
  };
  