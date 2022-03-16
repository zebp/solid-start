import { useRouteData, Link } from "solid-app-router";

import { getPosts } from "~/post";
import { createResource, For } from "solid-js";
import server from "solid-start/server";
import { Title } from "solid-meta";

export const routeData = () => {
  return createResource(server(getPosts));
};

export default function Posts() {
  const [posts] = useRouteData<ReturnType<typeof routeData>>();

  return (
    <>
      <Title>The Solid Blog</Title>
      <div class="relative max-w-lg mx-auto divide-y-2 divide-gray-200 lg:max-w-7xl">
        <div>
          <h2 class="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
            The Solid Blog
          </h2>
          <div class="mt-3 sm:mt-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:items-center">
            <p class="text-xl text-gray-500">
              Get articles in your inbox about how much Solid rocks.
            </p>
            <form class="mt-6 flex flex-col sm:flex-row lg:mt-0 lg:justify-end">
              <div>
                <label for="email-address" class="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email-address"
                  type="email"
                  autocomplete="email"
                  required
                  class="appearance-none w-full px-4 py-2 border border-gray-300 text-base rounded-md text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 lg:max-w-xs"
                  placeholder="Enter your email"
                />
              </div>
              <div class="mt-2 flex-shrink-0 w-full flex rounded-md shadow-sm sm:mt-0 sm:ml-3 sm:w-auto sm:inline-flex">
                <button
                  type="button"
                  class="w-full bg-indigo-600 px-4 py-2 border border-transparent rounded-md flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:inline-flex"
                >
                  Notify me
                </button>
              </div>
            </form>
          </div>
        </div>
        <div class="mt-6 pt-10 grid gap-16 lg:grid-cols-2 lg:gap-x-5 lg:gap-y-12">
          <For each={posts()}>
            {post => (
              <div>
                <p className="text-sm text-gray-500">
                  {/* <time dateTime={post.datetime}>{post.date}</time> */}
                </p>
                <Link href={`/post/${post.slug}`} className="mt-2 block">
                  <p className="text-xl font-semibold text-gray-900">{post.title}</p>
                  <p className="mt-3 text-base text-gray-500">{post.description}</p>
                </Link>
                <div className="mt-3">
                  <Link
                    href={`/post/${post.slug}`}
                    className="text-base font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Read full story
                  </Link>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </>
  );
}
