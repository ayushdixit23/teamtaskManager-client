"use client"
import api, { setTokenGetter } from "@/utils/api"
import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useState } from "react"
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

    useEffect(() => {
        setTokenGetter(() => accessToken);
    }, [accessToken]);

    useEffect(() => {
        const fetchUser = async () => {
            const response = await api.get('/users/me')
            if (response.data.success) {
                setUser(response.data.data as User || null)
            } else {
                toast.error(response.data.message || 'Failed to fetch user')
            }
        }
        if (accessToken) {
            fetchUser()
        }
    }, [accessToken])

    return (
        <AuthContext.Provider value={{ accessToken, user, setAccessToken, logout }}>
            {children}
        </AuthContext.Provider>
    )
}