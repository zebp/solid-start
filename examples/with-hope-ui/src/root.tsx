// @refresh reload
import { Suspense } from "solid-js";
import { Links, Meta, Routes, Scripts } from "solid-start/root";
import { ErrorBoundary } from "solid-start/error-boundary";
import "virtual:windi.css";
// 1. import `HopeProvider` component
import { HopeProvider } from "@hope-ui/solid";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Text
} from "@hope-ui/solid";
// 2. Wrap HopeProvider at the root of your app
export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <HopeProvider>
          <ErrorBoundary>
            <Suspense fallback={<div>Loading</div>}>
              <Accordion>
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Text flex={1} fontWeight="$medium" textAlign="start">
                        Composable
                      </Text>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel>
                    Compose your application interface with reusable building blocks.
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Text flex={1} fontWeight="$medium" textAlign="start">
                        Accessible
                      </Text>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel>
                    Hope UI follows WAI-ARIA standards, helping you to reach the largest audience
                    possible with less effort.
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
              {/* <Routes /> */}
            </Suspense>
          </ErrorBoundary>
        </HopeProvider>
        <Scripts />
      </body>
    </html>
  );
}
