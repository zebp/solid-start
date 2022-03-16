import invariant from "tiny-invariant";
import { createForm, FormError } from "solid-start/form";

import { createPost } from "~/post";
import server, { redirect } from "solid-start/server";
import { createComputed, createResource, createSignal, Match, Switch } from "solid-js";
import { Title } from "solid-meta";
import { PostPreview } from "../../components/PostPreview";
import { requireUserId } from "~/session";
import { useRouteData } from "solid-app-router";

export const routeData = () => {
  return createResource(
    server(async function () {
      await requireUserId(this, "/admin");
      return {};
    })
  );
};

function NewPost() {
  const newPost = createForm(
    server(async formData => {
      const title = formData.get("title");
      const slug = formData.get("slug");
      const markdown = formData.get("markdown");

      await new Promise(res => setTimeout(res, 1000));

      const errors: Record<string, boolean> = {};
      if (!title) errors.title = true;
      if (!slug) errors.slug = true;
      if (!markdown) errors.markdown = true;

      if (Object.keys(errors).length) {
        throw new FormError("An error occured", { fieldErrors: errors });
      }

      invariant(typeof title === "string");
      invariant(typeof slug === "string");
      invariant(typeof markdown === "string");
      await createPost({ title, slug, markdown });

      return redirect("/");
    })
  );

  const [editorState, setEditorState] = createSignal("editing");
  let randomSlug = `new-post-${Math.floor(Math.random() * 100)}`;
  const [title, setTitle] = createSignal("New blog post");
  const [slug, setSlug] = createSignal(randomSlug);
  const [markdown, setMarkdown] = createSignal("");

  return (
    <>
      <Title>✏️{title()}</Title>
      <div class="relative max-w-lg mx-auto lg:max-w-7xl">
        <h2
          contentEditable
          onInput={e => setTitle(e.currentTarget.innerText)}
          class="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl"
        >
          New blog post
        </h2>
        <h4
          class="mt-2 text-indigo-600 font-medium"
          contentEditable
          onInput={e => setSlug(e.currentTarget.innerText)}
        >
          /{title().replace(/\s+/g, "-").toLowerCase()}
        </h4>
        <div class="h-[0.2em] rounded-md mt-4 bg-gray-200 w-full" />
        <div class="mt-4">
          <newPost.Form method="post" key="new" class="mt-8">
            <input type="hidden" name="title" value={title()} />
            <input type="hidden" name="slug" value={slug()} />
            <div>
              <div class="flex items-center" aria-orientation="horizontal" role="tablist">
                <button
                  onClick={() => setEditorState("editing")}
                  id="tabs-1-tab-1"
                  class="hover:bg-gray-100 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md"
                  classList={{
                    "text-gray-900 bg-gray-100 hover:bg-gray-200": editorState() === "editing",
                    "text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100":
                      editorState() !== "editing"
                  }}
                  aria-controls="tabs-1-panel-1"
                  type="button"
                  role="tab"
                >
                  Write
                </button>
                <button
                  onClick={() => setEditorState("preview")}
                  type="button"
                  id="tabs-1-tab-2"
                  class="hover:bg-gray-100 ml-2 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md"
                  classList={{
                    "text-gray-900 bg-gray-100 hover:bg-gray-200": editorState() === "preview",
                    "text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100":
                      editorState() !== "preview"
                  }}
                  aria-controls="tabs-1-panel-2"
                  role="tab"
                >
                  Preview
                </button>
              </div>
              <label class="text-red-400">
                {newPost.submission("new")?.error?.fieldErrors?.title ? (
                  <em>Title is required</em>
                ) : null}
              </label>
              <div class="mt-2">
                <Switch>
                  <Match when={editorState() === "editing"}>
                    <div
                      id="tabs-1-panel-1"
                      class="p-0.5 -m-0.5 rounded-lg"
                      aria-labelledby="tabs-1-tab-1"
                      role="tabpanel"
                      tabindex="0"
                    >
                      <label for="markdown" class="sr-only">
                        Post
                      </label>
                      <div>
                        <textarea
                          onInput={e => setMarkdown(e.currentTarget.value)}
                          rows={20}
                          name="markdown"
                          id="markdown"
                          value={markdown()}
                          class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Write your post in markdown..."
                        ></textarea>
                      </div>
                    </div>
                  </Match>
                  <Match when={editorState() === "preview"}>
                    <div
                      id="tabs-1-panel-2"
                      class="p-0.5 -m-0.5 rounded-lg"
                      aria-labelledby="tabs-1-tab-2"
                      role="tabpanel"
                      tabindex="0"
                    >
                      <div class="border-b">
                        <div class="mx-px mt-px px-3 pt-2 pb-12 text-sm leading-5 text-gray-800">
                          <PostPreview markdown={markdown()} />
                        </div>
                      </div>
                    </div>
                  </Match>
                </Switch>
              </div>
            </div>
            <div class="mt-2 flex justify-end">
              <button
                type="submit"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {newPost.submission("new") ? "Creating..." : "Create Post"}
              </button>
            </div>
          </newPost.Form>
        </div>
      </div>
    </>
  );
}

export default function Route() {
  const [data] = useRouteData();
  createComputed(data);

  return <NewPost />;
}
