import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';

// Some Node versions ship an experimental native `localStorage` that
// requires a --localstorage-file flag to actually function; without
// it, the methods exist but are broken. Rather than depend on
// whichever localStorage implementation happens to be present in a
// given environment, we stub in a simple, predictable in-memory one
// for every test run.
function createMockLocalStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
}

beforeEach(() => {
  vi.stubGlobal('localStorage', createMockLocalStorage());
});

afterEach(() => {
  localStorage.clear();
});