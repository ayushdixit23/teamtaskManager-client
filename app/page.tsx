"use client"
import { useAuthContext } from "@/providers/AuthContext";

export default function Home() {
  const { logout, user } = useAuthContext();
  return (
    <>
      {user ? (
        <div>
          <h1>Welcome {user.name}</h1>
        </div>
      ) : (
        <button
          onClick={() => {
            logout();
          }}
        >
          Logout
        </button>
      )}
    </>
  );
}
