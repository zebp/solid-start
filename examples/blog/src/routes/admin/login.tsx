import { createForm } from "solid-start/form";
import server from "solid-start/server";
import invariant from "tiny-invariant";
import { createUserSession } from "~/session";

export default function Login() {
  const loginForm = createForm(
    server(async formData => {
      let secret = formData.get("secret");
      invariant(typeof secret === "string" && secret === "Hello", "That's the wrong secret");
      return await createUserSession(secret, "/admin");
    })
  );
  
  return (
    <>
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <loginForm.Form class="space-y-6" key="login">
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Secret
              </label>
              <div class="mt-1">
                <input
                  id="secret"
                  name="secret"
                  type="password"
                  autocomplete="current-password"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </loginForm.Form>
        </div>
      </div>
    </>
  );
}
