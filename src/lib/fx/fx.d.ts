// Types for the vendored taste-skill effects runtime (fx.js). Only what The Dreamers uses.
export type FxPalette = { bg: string; surface?: string; ink?: string; muted?: string; accent?: string; accentInk?: string };
export type FxEffect = { id: string; name: string; family: string; params: Record<string, unknown>; mount: (...args: unknown[]) => unknown };
export type FxController = { destroy(): void; pause(): void; resume(): void };
export function mount(
  el: HTMLElement,
  effect: FxEffect,
  opts?: { palette?: FxPalette; params?: Record<string, number>; seed?: number | string }
): Promise<FxController>;
declare const fx: { mount: typeof mount };
export default fx;
