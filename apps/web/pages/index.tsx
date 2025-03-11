import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAppSelector } from "../src/store";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isRouting, setIsRouting] = useState(false);

  useEffect(() => {
    // Prevent multiple routing attempts
    if (isRouting) return;

    // Only run client-side
    if (typeof window !== "undefined") {
      setIsRouting(true);

      if (isAuthenticated) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, router, isRouting]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-solid border-indigo-500 border-r-transparent"></div>
    </div>
  );
}
