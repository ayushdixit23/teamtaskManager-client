"use client"
import { useAuthContext } from "@/providers/AuthContext";
import api from "@/utils/api";
import { toast } from "react-toastify";

export default function Home() {
  const { logout, user } = useAuthContext();

  const fetchUser = async () => {
    await api.get('/users/me');
    await api.get('/users/me');
    await api.get('/users/me');
    await api.get('/users/me');
    await api.get('/users/me');
    await api.get('/users/me');
  }
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
      <button
      className="bg-blue-500 text-white p-2 rounded-md cursor-pointer"
        onClick={() => {
          fetchUser();
        }}
      >
        fetch user
      </button>
    </>
  );
}
