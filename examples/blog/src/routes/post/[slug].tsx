// import invariant from "tiny-invariant";

import { Link, useRouteData } from "solid-app-router";
import { createResource, Show } from "solid-js";
import { Title } from "solid-meta";
import server from "solid-start/server";
import { getPost } from "~/post";

export const routeData = ({ params }) => {
  return createResource(() => params.slug, server(getPost));
};

export default function PostSlug() {
  const [post] = useRouteData<ReturnType<typeof routeData>>();
  return (
    <>
      <Show when={post()}>
        <Title>{post().title}</Title>
        <div class="relative max-w-lg mx-auto lg:max-w-7xl divide-y-2 divide-gray-200">
          <Link class="text-base font-semibold text-indigo-600 hover:text-indigo-500" href="../..">
            Back to posts
          </Link>
          <div class="mt-2">
            <div class="prose mt-8" innerHTML={post().html}></div>
          </div>
        </div>
      </Show>
    </>
  );
}
