"use client"
import { useAuthContext } from "@/providers/AuthContext";

export default function Home() {
  const { logout, user } = useAuthContext();
  return (
    <>
      <h1>Welcome {user?.name}</h1>
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
