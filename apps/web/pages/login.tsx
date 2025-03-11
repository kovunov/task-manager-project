import { useRouter } from "next/router";
import { useEffect } from "react";
import { LoginForm } from "../src/components/Auth/LoginForm";
import { useAppSelector } from "../src/store";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  return <LoginForm />;
}
