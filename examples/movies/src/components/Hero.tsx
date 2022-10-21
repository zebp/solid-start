import { Show } from "solid-js";
import * as styles from "./Hero.module.scss";

import { imageConfigDefault } from "../components/image/image-config";
import { ImageConfigContext } from "../components/image/image-config-context";
import { tmdbLoader, tmdbSizeMap } from "../services/tmdbAPI";
import Image from "./image/Image";

export function Hero(props) {
  const stars = () => (props.item.vote_average ? props.item.vote_average * 10 : 0);
  const name = () => (props.item.title ? props.item.title : props.item.name);
  return (
    <div>
      <div class={styles.hero}>
        <div class={styles.backdrop}>
          <div>
            <button
              v-if="trailer"
              class={styles.play}
              type="button"
              aria-label="Play Trailer"
              onClick="openModal"
            >
              {/* <CirclePlayIcon /> */}
            </button>
            <ImageConfigContext.Provider
              value={{
                ...imageConfigDefault,
                imageSizes: tmdbSizeMap.backdrop,
                deviceSizes: tmdbSizeMap.backdrop,
                loader: "custom"
              }}
            >
              <Image
                src={props.item.backdrop_path}
                alt=""
                width={1280}
                height={720}
                class={styles.image}
                style={{
                  width: "100%"
                }}
                loader={tmdbLoader}
              />
            </ImageConfigContext.Provider>
          </div>
        </div>

        <div class={styles.pane}>
          <div>
            <h1 class={styles.name}>
              {name()}

              {/* <template v-else>
          <A to="{ name: `${type}-id`, params: { id: item.id } }">
            { props.item.name }
          </A>
        </template> */}
            </h1>
            <div class={styles.meta}>
              <div v-if="stars || item.vote_count" class={styles.rating}>
                <Show when={stars()}>
                  <div class={styles.stars}>
                    <div style={{ width: `${stars()}%` }} />
                  </div>
                </Show>

                <Show when={props.item.vote_count > 0}>
                  <div>{props.item.vote_count} Reviews</div>
                </Show>
              </div>

              <div class={styles.info}>
                <Show when={props.item.number_of_seasons}>
                  <span>Season {props.item.number_of_seasons}</span>
                </Show>
                {/* <span v-if="yearStart">{{ yearStart }}</span>
        <span v-if="item.runtime">{{ item.runtime | runtime }}</span>
        <span v-if="cert">Cert. {{ cert }}</span> */}
              </div>
            </div>
            <div class={styles.desc}>{props.item.overview}</div>
          </div>
          {/* <transition
        appear
        name="hero">
        <div>
          <h1 class="$style.name">
            <template v-if="isSingle">
              {{ name }}
            </template>
  
            <template v-else>
              <nuxt-link :to="{ name: `${type}-id`, params: { id: item.id } }">
                {{ name }}
              </nuxt-link>
            </template>
          </h1>
  
          <div class="$style.meta">
            <div
              v-if="stars || item.vote_count"
              class="$style.rating">
              <div
                v-if="stars"
                class="$style.stars">
                <div :style="{ width: `${stars}%` }" />
              </div>
  
              <div v-if="item.vote_count > 0">
                {{ item.vote_count | numberWithCommas }} Reviews
              </div>
            </div>
  
            <div class="$style.info">
              <span v-if="item.number_of_seasons">Season {{ item.number_of_seasons }}</span>
              <span v-if="yearStart">{{ yearStart }}</span>
              <span v-if="item.runtime">{{ item.runtime | runtime }}</span>
              <span v-if="cert">Cert. {{ cert }}</span>
            </div>
          </div>
  
          <div class="$style.desc">
            {{ item.overview | truncate(200) }}
          </div>
  
          <button
            v-if="trailer"
            class="button button--icon"
            class="$style.trailer"
            type="button"
            onClick="openModal">
            <PlayIcon class="icon" />
            <span class="txt">Watch Trailer</span>
          </button>
        </div> */}
        </div>
      </div>
    </div>
  );
}

export default Hero;
