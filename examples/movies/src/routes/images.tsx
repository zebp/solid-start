import { Show } from "solid-js";
import { A, useLocation } from "solid-start";
import Image from "~/components/image/Image";
import { tmdbLoader, tmdbSizeMap } from "../services/tmdbAPI";

export default function Images() {
  const location = useLocation();
  const path = (name: string) => name == "" || location.query.test == name;
  return (
    <div style={{ padding: "10rem", "font-size": "20px" }}>
      <div style={{ display: "flex", gap: "20px" }}>
        <A href="/images?test=absolute">Absolute</A>
        <A href="/images?test=basic">Basic</A> <A href="/images?test=blur">Blur</A>{" "}
        <A href="/images?test=priority">Priority</A>{" "}
      </div>
      <hr />
      <Show when={path("absolute")}>
        <h1>Absolute paths:</h1>
        <Image
          width={342}
          height={556}
          src="https://image.tmdb.org/t/p/w780/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg"
          alt="Test alt"
        />
      </Show>
      <Show when={path("basic")}>
        <h1>Basic Images</h1>
        <div>
          <Image
            width={342}
            height={556}
            deviceSizes={tmdbSizeMap.backdrop}
            src="/jsoz1HlxczSuTx0mDl2h0lxy36l.jpg"
            alt="Test alt"
            loader={tmdbLoader}
          />
          <Image
            width={1200}
            height={768}
            deviceSizes={tmdbSizeMap.backdrop}
            src="/jsoz1HlxczSuTx0mDl2h0lxy36l.jpg"
            alt="Test alt"
            loader={tmdbLoader}
          />
        </div>
      </Show>
      <Show when={path("blur")}>
        <h1>Blur</h1>
        <Image
          width={1200}
          height={768}
          deviceSizes={tmdbSizeMap.backdrop}
          src="/jsoz1HlxczSuTx0mDl2h0lxy36l.jpg"
          alt="Test alt"
          loader={tmdbLoader}
          placeholder="blur"
        />
      </Show>
      <Show when={path("priority")}>
        <h1>Priority</h1>
        <Image
          width={1200}
          height={768}
          deviceSizes={tmdbSizeMap.poster}
          src="/jsoz1HlxczSuTx0mDl2h0lxy36l.jpg"
          alt="Test alt"
          loader={tmdbLoader}
          priority
        />
      </Show>
    </div>
  );
}

// jsoz1HlxczSuTx0mDl2h0lxy36l.jpg
