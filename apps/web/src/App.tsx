import { SessionProvider } from "@/lib/session";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/router";

export default function App() {
  return (
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  );
}
