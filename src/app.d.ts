// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Auth } from "$lib/server/auth.js";

type SessionResult = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>;

declare global {
  /** True when built on Vercel, where /_vercel/image can optimize remote images. */
  const __VERCEL_IMAGES__: boolean;

  namespace App {
    // interface Error {}
    interface Locals {
      user: SessionResult["user"] | null;
      session: SessionResult["session"] | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
