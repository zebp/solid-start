// @refresh reload
import { ErrorBoundary } from "solid-start/error-boundary";
import { Links, Meta, Routes, Scripts } from "solid-start/root";
import "./index.css";

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body class="antialiased h-full">
        <ErrorBoundary>
          <main class="bg-white pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
            <Routes />
          </main>
        </ErrorBoundary>
        <Scripts />
      </body>
    </html>
  );
}
