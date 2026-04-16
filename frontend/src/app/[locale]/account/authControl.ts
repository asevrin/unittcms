import { SignUpResponse, TokenType, UserType } from '@/types/user';
import Config from '@/config/config';
import { roles } from '@/config/selection';
import { logError } from '@/utils/errorHandler';
const apiServer = Config.apiServer;

async function signUp(newUser: UserType): Promise<SignUpResponse> {
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newUser),
  };

  const url = `${apiServer}/users/signup`;

  try {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error: unknown) {
    logError('Error sign up:', error);
    throw error;
  }
}

async function signIn(signInUser: UserType): Promise<TokenType> {
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(signInUser),
  };

  const url = `${apiServer}/users/signin`;

  try {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error: unknown) {
    logError('Error sign in:', error);
    throw error;
  }
}

async function signInAsGuest() {
  const guestUser = {
    id: null,
    email: generateRandomEmail(),
    password: 'guestpassword',
    username: 'Guest',
    role: roles.findIndex((entry) => entry.uid === 'user'),
    avatarPath: '',
  };
  const token = await signUp(guestUser);
  return token;
}

function generateRandomEmail() {
  const randomStringLength = 10;
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  const charactersLength = characters.length;

  for (let i = 0; i < randomStringLength; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return `${randomString}@example.com`;
}

export { signUp, signIn, signInAsGuest };
