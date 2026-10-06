import { ScrollViewStyleReset } from "expo-router/html";
import { PropsWithChildren } from "react";

/**
 * Web document shell. The app's ScrollViews are the scroll containers, so the document
 * itself must be exactly one viewport tall. `100dvh` tracks mobile browser toolbars
 * (plain 100vh is taller than the visible area on iOS/Android and causes clipped,
 * double-scrolling pages).
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="color-scheme" content="light dark" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const css = `
html, body, #root { height: 100%; }
@supports (height: 100dvh) { html, body, #root { height: 100dvh; } }
body { margin: 0; overflow: hidden; overscroll-behavior: none; background-color: #F5F6F8; -webkit-font-smoothing: antialiased; }
@media (prefers-color-scheme: dark) { body { background-color: #0B0D12; } }
#root { display: flex; overflow-x: hidden; }
input, textarea { font: inherit; }
`;
