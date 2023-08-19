import common from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import { execFile, spawn } from "child_process";
import { copyFileSync, writeFileSync } from "fs";
import { Miniflare } from "miniflare";
import { dirname, join, resolve } from "path";
import { rollup } from "rollup";
import { fileURLToPath } from "url";
import { promisify } from "util";
import { createServer } from "./dev-server.js";

export default function (miniflareOptions) {
  return {
    name: "cloudflare-pages",
    async dev(options, vite, dev) {
      const mf = new Miniflare({
        script: `
        export default {
          fetch: async (request, env) => {
            return await serve(request, env, globalThis);
          }
        }

        export const WebSocketDurableObject = WebSocketDurableObject1;
      `,
        globals: {
          WebSocketDurableObject1: class DO {
            state;
            env;
            promise;
            constructor(state, env) {
              this.state = state;
              this.env = env;
              this.promise = this.createProxy(state, env);
            }

            async createProxy(state, env) {
              const { WebSocketDurableObject } = await vite.ssrLoadModule("~start/entry-server");
              return new WebSocketDurableObject(state, env);
            }

            async fetch(request) {
              console.log("DURABLE_OBJECT", request.url);

              try {
                let dObject = await this.promise;
                return await dObject.fetch(request);
              } catch (e) {
                console.log("error", e);
              }
            }
          },
          serve: async (req, e, g) => {
            const {
              Request,
              Response,
              fetch,
              crypto,
              Headers,
              ReadableStream,
              WritableStream,
              WebSocketPair,
              TransformStream
            } = g;
            Object.assign(globalThis, {
              Request,
              Response,
              fetch,
              crypto,
              Headers,
              ReadableStream,
              WritableStream,
              TransformStream,
              WebSocketPair
            });

            console.log(
              "🔥",
              req.headers.get("Upgrade") === "websocket" ? "WEBSOCKET" : req.method,
              req.url
            );

            if (req.headers.get("Upgrade") === "websocket") {
              const url = new URL(req.url);
              console.log(url.search);
              const durableObjectId = e.DO_WEBSOCKET.idFromName(url.pathname + url.search);
              const durableObjectStub = e.DO_WEBSOCKET.get(durableObjectId);
              const response = await durableObjectStub.fetch(req);
              return response;
            }

            try {
              return await dev.fetch({
                request: req,
                env: e,
                clientAddress: req.headers.get("cf-connecting-ip"),
                locals: {}
              });
            } catch (e) {
              console.log("error", e);
              return new Response(e.toString(), { status: 500 });
            }
          }
        },
        modules: true,
        kvPersist: true,
        ...miniflareOptions
      });

      console.log("🔥", "starting miniflare");

      return await createServer(vite, mf, {});
    },
    start(config, { port }) {
      process.env.PORT = port;
      const proc = spawn("node", [
        join(config.root, "node_modules", "wrangler", "bin", "wrangler.js"),
        "pages",
        "dev",
        "./dist/public",
        "--port",
        process.env.PORT
      ]);
      proc.stdout.pipe(process.stdout);
      proc.stderr.pipe(process.stderr);
      return `http://localhost:${process.env.PORT}`;
    },
    async build(config, builder) {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      if (!config.solidOptions.ssr) {
        await builder.spaClient(join(config.root, "dist", "public"));
        await builder.server(join(config.root, ".solid", "server"));
      } else if (config.solidOptions.islands) {
        await builder.islandsClient(join(config.root, "dist", "public"));
        await builder.server(join(config.root, ".solid", "server"));
      } else {
        await builder.client(join(config.root, "dist", "public"));
        await builder.server(join(config.root, ".solid", "server"));
      }

      copyFileSync(join(__dirname, "entry.js"), join(config.root, ".solid", "server", "server.js"));
      const bundle = await rollup({
        input: join(config.root, ".solid", "server", "server.js"),
        plugins: [
          json(),
          nodeResolve({
            preferBuiltins: true,
            exportConditions: ["worker", "solid"]
          }),
          common({ strictRequires: true, ...config.build.commonjsOptions })
        ]
      });

      // or write the bundle to disk
      await bundle.write({
        format: "esm",
        inlineDynamicImports: true,
        file: join(config.root, "functions", "[[path]].js")
      });

      // closes the bundle
      await bundle.close();

      await config.solidOptions.router.init();

      const staticRoutes = config.solidOptions.prerenderRoutes || [];

      writeFileSync(
        join(config.root, "dist", "public", "_routes.json"),
        JSON.stringify({
          version: 1,
          include: ["/*"],
          exclude: staticRoutes
        }),
        "utf8"
      );

      writeFileSync(
        join(config.root, "dist", "public", "_headers"),
        getHeadersFile(staticRoutes),
        "utf8"
      );

      for (let route of staticRoutes) {
        const originalRoute = route;
        if (route.startsWith("/")) route = route.slice(1);

        await run({
          entry: join(config.root, "functions", "[[path]].js"),
          output: join(
            config.root,
            "dist",
            "public",
            originalRoute.endsWith("/") ? `${originalRoute}index.html` : `${route}.html`
          ),
          url: `http://localhost:8787/${route}`
        });
      }
    }
  };
}

/**
 * @see https://developers.cloudflare.com/pages/platform/headers/
 */
// prettier-ignore
const getHeadersFile = (staticRoutes) => {
  let headers = `/assets/*
  Cache-Control: public, immutable, max-age=31536000
  `.trim();

  for (const route of staticRoutes) {
    headers += `\n${route}\n  Cache-Control: public, max-age=120`;
  }

  return headers
}

const exec = promisify(execFile);
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const pathToRunner = resolve(__dirname, "writeWorkerToDisk.js");

async function run({ entry, output, url }) {
  const { stdout, stderr } = await exec(
    "node",
    [pathToRunner, entry, output, url, "--trace-warnings"],
    {
      env: {
        NODE_NO_WARNINGS: "1",
        ...process.env
      }
    }
  );
  if (stdout.length) console.log(stdout);
  if (stderr.length) console.log(stderr);
}
