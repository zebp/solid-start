import { createForm } from "solid-start/form";
import server from "solid-start/server";
import { logout } from "~/session";

const logoutForm = createForm(
  server(async function () {
    return await logout(this.request);
  })
);

export function LogoutButton() {
  return (
    <logoutForm.Form>
      <button
        name="logout"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        type="submit"
      >
        Logout
      </button>
    </logoutForm.Form>
  );
}
