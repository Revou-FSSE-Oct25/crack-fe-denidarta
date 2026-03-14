'use client';

import { useState } from 'react';
import {
  Button,
  Form,
  PasswordInput,
  TextInput,
  Tile,
  InlineNotification,
  Stack,
} from '@carbon/react';
import { ArrowRight, UserAvatar } from '@carbon/icons-react';
import styles from './page.module.scss';
import {useForm} from 'react-hook-form';

// In a real app this would come from session/auth context.
// Using mock student data for demonstration.

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [email, setEmail] = useState('');
  const { register, handleSubmit, watch, formState: { errors }} = useForm();
  
  const onSubmit = () => {
    console.log("Signing in as", );
  };
  
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>

        <div className={styles.brand}>
          <UserAvatar size={32} />
          <span>LMS Portal</span>
        </div>

        <Tile className={styles.tile}>
          <div className={styles.header}>
            <h1>Sign in</h1>
            <p>Welcome back. Enter your credentials to continue.</p>
          </div>

          {error && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              lowContrast
              className={styles.notification}
              onCloseButtonClick={() => setError(null)}
            />
          )}

          <Form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack gap={6}>
              <TextInput
                id="email"
                type="email"
                labelText="Email address"
                placeholder={"Registered email address"}
                value={email}
              />

              <PasswordInput
                id="password"
                labelText="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                invalid={passwordMismatch}
                invalidText=" "
              />

              <Button
                type="submit"
                kind="primary"
                size="lg"
                renderIcon={ArrowRight}
                className={styles.submitButton}
              >
                Sign in
              </Button>
            </Stack>
          </Form>
        </Tile>

        <p className={styles.footer}>
          Having trouble?{' '}
          <a href="mailto:support@lms.dev">Contact support</a>
        </p>
      </div>
    </div>
  );
}
