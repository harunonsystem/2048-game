declare global {
  interface Window {
    umami?: {
      track: (
        event: string,
        data?: Record<string, string | number | boolean>,
      ) => void;
    };
  }
}

export type GameEvent =
  | "game_start"
  | "game_over"
  | "game_won"
  | "replay_click"
  | "share_x_click"
  | "copy_result_click"
  | "mode_change"
  | "language_change";

export type EventData = Record<string, string | number | boolean>;

export function trackEvent(event: GameEvent, data?: EventData): void {
  if (typeof window === "undefined") return;
  window.umami?.track(event, data);
}
