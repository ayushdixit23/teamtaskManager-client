"use client"
import api from "@/utils/api"
import { useRouter } from "next/navigation"
import { createContext, useContext, useState } from "react"
import { toast } from "react-toastify"

interface User {
    id: number
    name: string
    email: string
    image_url: string
}

interface AuthContextType {
    accessToken: string
    user: User | null
    setAccessToken: (accessToken: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType>({
    accessToken: '',
    user: null,
    setAccessToken: () => { },
    logout: () => { },
})

export function useAuthContext() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuthContext must be used within a AuthProvider')
    }
    return context
}


export default function AuthProvider({ children }: { children: React.ReactNode } & React.PropsWithChildren) {
    const [accessToken, setAccessToken] = useState('')
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter()

    const logout = async () => {
        try {
            const response = await api.post('/auth/logout')
            if (response.data.success) {
                setAccessToken('')
                setUser(null)
                router.push('/login')
            } else {
                toast.error(response.data.message || 'Failed to logout')
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to logout')
        }
    }

    console.log(accessToken, 'accessToken')

    return (
        <AuthContext.Provider value={{ accessToken, user, setAccessToken, logout }}>
            {children}
        </AuthContext.Provider>
    )
}