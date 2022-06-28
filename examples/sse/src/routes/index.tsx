import { createEffect, onCleanup } from "solid-js";
import server from "solid-start/server";
import Counter from "~/components/Counter";
import "./index.css";

function createEventStream(
  { url }: { url: string },
  onMessage?: (message: MessageEvent<any>) => void
) {
  createEffect(() => {
    const eventSource = new EventSource(url);
    eventSource.addEventListener("open", () => {
      console.log("opened");
    });
    eventSource.onmessage = event => {
      console.log(event);
      // onMessage?.(event);
    };

    eventSource.addEventListener("chat", event => {
      console.log(event);
    });

    onCleanup(() => eventSource.close());
  });
}

function eventStream(
  request: Request,
  init: (send: (type: string, data: any) => void) => () => void
) {
  let stream = new ReadableStream({
    start(controller) {
      let encoder = new TextEncoder();
      let send = (event: string, data: string) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };
      let cleanup = init(send);
      let closed = false;
      let close = () => {
        console.log("closing");
        if (closed) return;
        cleanup();
        closed = true;
        request.signal.removeEventListener("abort", close);
        controller.close();
      };
      request.signal.addEventListener("abort", close);
      if (request.signal.aborted) {
        close();
        return;
      }
    }
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
}

export default function Home() {
  createEventStream(
    server(async () =>
      eventStream(server.request, send => {
        send("chat", "Hello");
        send("chat", "World");
        setTimeout(() => {
          send("chat", "Goodbye");
        }, 5000);
        return () => {};
      })
    )
  );

  return (
    <main>
      <h1>Hello world!</h1>
      <Counter />
      <p>
        Visit{" "}
        <a href="https://solidjs.com" target="_blank">
          solidjs.com
        </a>{" "}
        to learn how to build Solid apps.
      </p>
    </main>
  );
}
