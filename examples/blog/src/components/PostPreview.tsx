import { marked } from "marked";
import server from "solid-start/server";
import { createResource } from "solid-js";

export function PostPreview(props: { markdown: string }) {
  const [renderedMarkdown] = createResource(() => props.markdown, server(marked));

  return <div innerHTML={renderedMarkdown()} />;
}
