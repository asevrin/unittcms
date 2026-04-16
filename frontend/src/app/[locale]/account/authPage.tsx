'use client';
import { useState, useContext } from 'react';
import { Input, Button, Card, CardHeader, CardBody } from '@heroui/react';
import { ChevronRight, Eye, EyeOff } from 'lucide-react';
import { signUp, signIn, signInAsGuest } from './authControl';
import { isValidEmail, isValidPassword } from './validate';
import { Link } from '@/src/i18n/routing';
import { UserType, AuthMessages } from '@/types/user';
import { roles } from '@/config/selection';
import { TokenContext } from '@/utils/TokenProvider';
import { useRouter } from '@/src/i18n/routing';
import Config from '@/config/config';
import { LocaleCodeType } from '@/types/locale';
import Footer from '@/components/Footer';
const isDemoSite = Config.isDemoSite;

type Props = {
  isSignup: boolean;
  messages: AuthMessages;
  locale: LocaleCodeType;
};

export default function AuthPage({ isSignup, messages, locale }: Props) {
  const router = useRouter();
  const context = useContext(TokenContext);
  const [user, setUser] = useState<UserType>({
    id: null,
    email: '',
    password: '',
    username: '',
    role: roles.findIndex((entry) => entry.uid === 'user'),
    avatarPath: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  const validate = async () => {
    if (!isValidEmail(user.email)) {
      setInfoMessage('');
      setErrorMessage(messages.invalidEmail);
      return;
    }

    if (!isValidPassword(user.password)) {
      setInfoMessage('');
      setErrorMessage(messages.invalidPassword);
      return;
    }

    if (isSignup) {
      if (!user.username) {
        setInfoMessage('');
        setErrorMessage(messages.usernameEmpty);
        return;
      }

      if (user.password !== confirmPassword) {
        setInfoMessage('');
        setErrorMessage(messages.passwordDoesNotMatch);
        return;
      }
    }

    await submit();
  };

  const submit = async () => {
    if (isSignup) {
      try {
        const result = await signUp(user);
        if (result.requiresApproval) {
          setErrorMessage('');
          setInfoMessage(messages.signupPendingApproval);
          return;
        }
        if (result.access_token && result.expires_at) {
          const token = {
            access_token: result.access_token,
            expires_at: result.expires_at,
            user: result.user,
          };
          context.setToken(token);
          context.storeTokenToLocalStorage(token);
          router.push('/account', { locale: locale });
          return;
        }
        setErrorMessage(messages.signupError);
        return;
      } catch (error) {
        setInfoMessage('');
        setErrorMessage(error instanceof Error ? error.message : messages.signupError);
        return;
      }
    } else {
      let token;
      try {
        token = await signIn(user);
      } catch (error) {
        setInfoMessage('');
        if (error instanceof Error && error.message === 'Approval required') {
          setErrorMessage(messages.approvalPending);
          return;
        }
        setErrorMessage(messages.signinError);
        return;
      }

      context.setToken(token);
      context.storeTokenToLocalStorage(token);
      router.push('/account', { locale: locale });
    }
  };

  const handleSignInAsGuest = async () => {
    const token = await signInAsGuest();
    context.setToken(token);
    context.storeTokenToLocalStorage(token);
    router.push('/account', { locale: locale });
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col justify-around">
      <Card className="w-[380px] md:w-[480px]">
        <CardHeader className="px-4 pt-4 pb-0 flex justify-between">
          <h4 className="font-bold text-large">{messages.title}</h4>
          <Button
            as={Link}
            href={isSignup ? '/account/signin' : '/account/signup'}
            locale={locale}
            color="primary"
            variant="light"
            endContent={<ChevronRight size={16} />}
          >
            {messages.linkTitle}
          </Button>
        </CardHeader>
        <CardBody className="overflow-visible px-4 pt-0 pb-4">
          <form>
            {infoMessage && <div className="my-3 text-success">{infoMessage}</div>}
            {errorMessage && <div className="my-3 text-danger">{errorMessage}</div>}
            <Input
              isRequired
              type="email"
              label={messages.email}
              autoComplete="email"
              className="mt-3"
              onChange={(e) => {
                setInfoMessage('');
                setErrorMessage('');
                setUser({
                  ...user,
                  email: e.target.value,
                });
              }}
            />
            {isSignup && (
              <Input
                isRequired
                type="username"
                label={messages.username}
                autoComplete="username"
                className="mt-3"
                onChange={(e) => {
                  setInfoMessage('');
                  setErrorMessage('');
                  setUser({
                    ...user,
                    username: e.target.value,
                  });
                }}
              />
            )}
            <Input
              label={messages.password}
              variant="bordered"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              className="mt-3"
              type={isPasswordVisible ? 'text' : 'password'}
              endContent={
                <button className="focus:outline-none" type="button" onClick={togglePasswordVisibility}>
                  {isPasswordVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              }
              onChange={(e) => {
                setInfoMessage('');
                setErrorMessage('');
                setUser({
                  ...user,
                  password: e.target.value,
                });
              }}
            />
            {isSignup && (
              <Input
                label={messages.confirmPassword}
                variant="bordered"
                autoComplete="new-password"
                className="mt-3"
                type={isPasswordVisible ? 'text' : 'password'}
                endContent={
                  <button className="focus:outline-none" type="button" onClick={togglePasswordVisibility}>
                    {isPasswordVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                }
                onChange={(e) => {
                  setInfoMessage('');
                  setErrorMessage('');
                  setConfirmPassword(e.target.value);
                }}
              />
            )}

            {isDemoSite && <div className="my-3 text-default-600">{messages.demoPageWarning}</div>}

            <div className="flex justify-end items-center mt-3">
              <Button color="primary" onPress={validate}>
                {messages.submitTitle}
              </Button>
              {!isSignup && isDemoSite && (
                <Button
                  className="ms-3 bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
                  onPress={handleSignInAsGuest}
                >
                  {messages.signInAsGuest}
                </Button>
              )}
            </div>
          </form>
        </CardBody>
      </Card>
      <Footer locale={locale} />
    </div>
  );
}
