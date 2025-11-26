"use client"
import api, { setTokenGetter } from "@/utils/api"
import { useRouter, usePathname } from "next/navigation"
import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { RESTRICTED_PATHS } from "@/utils/constants"
import { Loader2 } from "lucide-react"

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
    const pathname = usePathname()
    const [isLoading, setIsLoading] = useState(true)

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
        // Don't refresh token on login/signup pages
        const isAuthPage = RESTRICTED_PATHS.includes(pathname)
        if (isAuthPage) {
            setIsLoading(false)
            return
        }

        const refreshAccessToken = async () => {
            try {
                const response = await api.post('/auth/refresh-token')
                if (response.data.success && response.data.data?.token) {
                    setAccessToken(response.data.data.token)
                } else {
                    setIsLoading(false)
                }
            } catch (error: any) {
                // If refresh fails, user will be redirected to login by middleware
                console.error('Failed to refresh token:', error)
                setIsLoading(false)
            }
        }

        if (!accessToken) {
            refreshAccessToken()
        } else {
            setIsLoading(false)
        }
    }, [pathname])

    useEffect(() => {
        // Don't fetch user on login/signup pages
        const isAuthPage = RESTRICTED_PATHS.includes(pathname)
        if (isAuthPage) {
            return
        }

        const fetchUser = async () => {
            setIsLoading(true)
            try {
                const response = await api.get('/users/me')
                if (response.data.success) {
                    setUser(response.data.data as User || null)
                } else {
                    toast.error(response.data.message || 'Failed to fetch user')
                }
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to fetch user')
            } finally {
                setIsLoading(false)
            }
        }
        if (accessToken) {
            fetchUser()
        } else {
            setIsLoading(false)
        }
    }, [accessToken, pathname])

    return (
        <AuthContext.Provider value={{ accessToken, user, setAccessToken, logout }}>
            {isLoading ? <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div> : children}
        </AuthContext.Provider>
    )
}