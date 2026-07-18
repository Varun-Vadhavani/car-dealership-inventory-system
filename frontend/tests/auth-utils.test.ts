import { describe, it, expect, beforeEach } from 'vitest';
import { getUserRole } from '../src/utils/auth';

// jwt-decode just parses the payload, no signature check — so a
// fake unsigned token is sufficient to test this decode logic.
function fakeToken(payload: object) {
  const base64 = (obj: object) => btoa(JSON.stringify(obj));
  return `${base64({ alg: 'none' })}.${base64(payload)}.fakesignature`;
}

describe('getUserRole', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return null when no token exists', () => {
    expect(getUserRole()).toBeNull();
  });

  it('should return the role from a valid token', () => {
    localStorage.setItem('token', fakeToken({ userId: '1', role: 'ADMIN' }));
    expect(getUserRole()).toBe('ADMIN');
  });
});