import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "./login";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  return <AuthPage initialMode="register" />;
}
