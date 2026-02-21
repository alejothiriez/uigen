// @vitest-environment node
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { jwtVerify } from "jose";

vi.mock("server-only", () => ({}));

const mockCookieSet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ set: mockCookieSet })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

test("createSession sets an httpOnly cookie", async () => {
  const { createSession } = await import("@/lib/auth");

  await createSession("user-123", "user@example.com");

  expect(mockCookieSet).toHaveBeenCalledOnce();
  const [name, , options] = mockCookieSet.mock.calls[0];
  expect(name).toBe("auth-token");
  expect(options.httpOnly).toBe(true);
});

test("createSession sets a valid JWT as the cookie value", async () => {
  const { createSession } = await import("@/lib/auth");

  await createSession("user-123", "user@example.com");

  const token = mockCookieSet.mock.calls[0][1];
  const secret = new TextEncoder().encode("development-secret-key");
  const { payload } = await jwtVerify(token, secret);

  expect(payload.userId).toBe("user-123");
  expect(payload.email).toBe("user@example.com");
});

test("createSession JWT expires in ~7 days", async () => {
  const { createSession } = await import("@/lib/auth");
  const before = Date.now();

  await createSession("user-123", "user@example.com");

  const token = mockCookieSet.mock.calls[0][1];
  const secret = new TextEncoder().encode("development-secret-key");
  const { payload } = await jwtVerify(token, secret);

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const expMs = (payload.exp as number) * 1000;
  expect(expMs).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(expMs).toBeLessThanOrEqual(before + sevenDaysMs + 5000);
});

test("createSession sets secure cookie in production", async () => {
  vi.stubEnv("NODE_ENV", "production");
  const { createSession } = await import("@/lib/auth");

  await createSession("user-123", "user@example.com");

  const options = mockCookieSet.mock.calls[0][2];
  expect(options.secure).toBe(true);
});

test("createSession sets non-secure cookie outside production", async () => {
  vi.stubEnv("NODE_ENV", "test");
  const { createSession } = await import("@/lib/auth");

  await createSession("user-123", "user@example.com");

  const options = mockCookieSet.mock.calls[0][2];
  expect(options.secure).toBe(false);
});

test("createSession uses lax sameSite and root path", async () => {
  const { createSession } = await import("@/lib/auth");

  await createSession("user-123", "user@example.com");

  const options = mockCookieSet.mock.calls[0][2];
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
});
