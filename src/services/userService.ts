// Removed custom JWT logic. Use Supabase Auth JWT.
// All local Postgres, Docker, JWT, and bcrypt logic has been removed. Use Supabase for all user and auth operations.

// Example placeholder for Supabase-based user creation
export async function createUser(name: string, email: string, password: string) {
  // Use Supabase client here in the future
  throw new Error('createUser should be implemented with Supabase Auth.');
}

// Supabase handles email verification. This function is not needed.
export async function verifyUserByToken(token: string): Promise<boolean> {
  throw new Error('verifyUserByToken should be implemented with Supabase Auth or is not needed.');
}

// Use Supabase client to find user by email if needed.
export async function findUserByEmail(email: string) {
  throw new Error('findUserByEmail should be implemented with Supabase or is not needed.');
}

// Use Supabase Auth for user validation.
export async function validateUser(email: string, password: string) {
  throw new Error('validateUser should be implemented with Supabase Auth.');
}
