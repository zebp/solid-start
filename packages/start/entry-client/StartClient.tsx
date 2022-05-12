import { MetaProvider } from "solid-meta";
import { Router } from "solid-app-router";
import { StartProvider } from "../server/StartContext";
import Root from "~/root";
import { getOwner } from "solid-js";
import { createDevtools } from "../dev/createDevtools";

const rootData = Object.values(import.meta.globEager("/src/root.data.(js|ts)"))[0];
const dataFn = rootData ? rootData.default : undefined;

export default function StartClient() {
  const owner = getOwner();
  if (process.env.NODE_ENV === "development") {
    createDevtools(owner);
  }
  return (
    <StartProvider>
      <MetaProvider>
        <Router data={dataFn}>
          <Root />
        </Router>
      </MetaProvider>
    </StartProvider>
  );
}
