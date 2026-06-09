import { describe, it, expect, beforeEach, vi } from "vitest";
import { trackEvent, type GameEvent, type EventData } from "../src/analytics";

describe("trackEvent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls window.umami.track with name and data when umami is present", () => {
    const track = vi.fn();
    window.umami = { track };

    trackEvent("game_start", { mode: 2048, language: "ja" });

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("game_start", {
      mode: 2048,
      language: "ja",
    });
  });

  it("calls window.umami.track with no data when data is omitted", () => {
    const track = vi.fn();
    window.umami = { track };

    trackEvent("game_start");

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("game_start", undefined);
  });

  it("does not throw when window.umami is undefined", () => {
    delete (window as { umami?: unknown }).umami;

    expect(() => trackEvent("game_over", { score: 100 })).not.toThrow();
  });

  it("does not throw when window is undefined", () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error - simulate non-browser env
    delete (globalThis as { window?: unknown }).window;

    expect(() => trackEvent("game_won", { mode: 2048 })).not.toThrow();

    globalThis.window = originalWindow;
  });

  it("accepts all declared GameEvent values without type error", () => {
    const track = vi.fn();
    window.umami = { track };

    const events: GameEvent[] = [
      "game_start",
      "game_over",
      "game_won",
      "replay_click",
      "share_x_click",
      "copy_result_click",
      "mode_change",
      "language_change",
    ];

    for (const e of events) {
      const data: EventData = { foo: "bar", n: 1, ok: true };
      trackEvent(e, data);
    }

    expect(track).toHaveBeenCalledTimes(events.length);
  });
});
