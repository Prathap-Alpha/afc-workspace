// Set only by the self-contained static export, never by the full hosted app.
export const isStaticDemo = Boolean(
  (window as Window & { __AFC_STATIC_DEMO__?: boolean }).__AFC_STATIC_DEMO__
);
