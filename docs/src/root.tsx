// @refresh reload
import { Routes } from "solid-start/root";

import "./code.css";
import "virtual:windi.css";

import { MDXProvider } from "solid-mdx";
import Nav from "./components/Nav";
import md from "./md";
import { createEffect } from "solid-js";
import tippy from "tippy.js";
import { Main } from "./components/Main";
import { createStore } from "solid-js/store";

export const [store, setStore] = createStore({
  darkMode: false
});
export default function Root() {
  createEffect(() => {
    tippy("[data-template]", {
      content(reference) {
        const id = reference.getAttribute("data-template");
        const template = document.getElementById(id);
        return template.innerHTML;
      },
      allowHTML: true
    });

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
      setStore("darkMode", true);
    } else {
      document.documentElement.classList.add("light");
      setStore("darkMode", false);
    }
  });
  return (
    <>
      <MDXProvider
        components={{
          ...md
        }}
      >
        <Nav />
        <Main>
          <Routes />
        </Main>
      </MDXProvider>
    </>
  );
}

import { useParams, Router, Route } from "solid-app-router";
import { createResource, JSX } from "solid-js";

function App() {
  return (
    <Router>
      <Route path="/user/:id" component={User} />
    </Router>
  );
}

function fetchUser(id: string) {
  return { name: "John" };
}

// ---cut---
function User() {
  const params = useParams();

  // fetch user based on the id that we get as a path parameter
  const [user] = createResource(() => params.slug, fetchUser);

  return <h1>{user().name}</h1>;
}
