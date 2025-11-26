"use client"
import { useAuthContext } from "@/providers/AuthContext";

export default function Home() {
  const { logout } = useAuthContext();
  return (
    <>
      <button
        onClick={() => {
          logout();
        }}
      >
        Logout
      </button>
    </>
  );
}
