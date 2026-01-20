import { describe, expect, it } from 'vitest';
import authReducer, { logoutUser, registerUser, setSessionId } from '../authSlice';
import type { AuthState } from '@/types/auth';

describe('authSlice', () => {
  it('registers a user and stores session id', () => {
    const state = authReducer(
      undefined,
      registerUser({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        sessionId: 's1',
      })
    );

    expect(state.user?.email).toBe('test@example.com');
    expect(state.sessionId).toBe('s1');
  });

  it('updates the session id', () => {
    const initial: AuthState = { user: null, sessionId: null };
    const state = authReducer(initial, setSessionId('s2'));
    expect(state.sessionId).toBe('s2');
  });

  it('clears session on logout', () => {
    const initial: AuthState = {
      user: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
      },
      sessionId: 's1',
    };
    const state = authReducer(initial, logoutUser());
    expect(state.sessionId).toBeNull();
    expect(state.user).not.toBeNull();
  });
});
