// This is a mock API for testing purposes
export const mockLogin = async (username: string, password: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test credentials
  if (username === 'test' && password === 'test123') {
    return {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        username: 'test'
      }
    };
  }

  // Simulate API error
  throw {
    response: {
      status: 401,
      data: {
        message: 'Invalid username or password'
      }
    }
  };
};
