import path from "path";
import fs from "fs";
import parseFrontMatter from "front-matter";
import invariant from "tiny-invariant";
import { marked } from "marked";

export type Post = {
  slug: string;
  title: string;
  description: string;
};

export type PostMarkdownAttributes = {
  title: string;
};

const postsPath = path.join(new URL(import.meta.url).pathname, "../../posts");

function isValidPostAttributes(attributes: any): attributes is PostMarkdownAttributes {
  return attributes?.title;
}

type NewPost = {
  title: string;
  slug: string;
  markdown: string;
};

export async function createPost(post: NewPost) {
  const md = `---\ntitle: ${post.title}\n---\n\n${post.markdown}`;
  await fs.promises.writeFile(path.join(postsPath, post.slug + ".md"), md);
  return getPost(post.slug);
}

export async function getPost(slug: string) {
  const filepath = path.join(postsPath, slug + ".md");
  const file = await fs.promises.readFile(filepath);
  const { attributes, body } = parseFrontMatter(file.toString());
  invariant(isValidPostAttributes(attributes), `Post ${filepath} is missing attributes`);
  const html = marked(body);
  return { slug, html, title: attributes.title };
}

export async function getPosts() {
  const dir = await fs.promises.readdir(postsPath);
  return Promise.all(
    dir.map(async filename => {
      const file = await fs.promises.readFile(path.join(postsPath, filename));
      const { attributes, body } = parseFrontMatter(file.toString());
      invariant(isValidPostAttributes(attributes));
      return {
        slug: filename.replace(/\.md$/, ""),
        title: attributes.title,
        description: body.substring(0, 100)
      };
    })
  ) as Promise<Post[]>;
}
