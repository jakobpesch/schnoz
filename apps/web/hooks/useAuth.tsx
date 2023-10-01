import { useToast } from "@chakra-ui/react"
import { useRouter } from "next/router"
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { AccessTokenResponse, isDataResponse, Profile } from "types"
import { eraseCookie, getCookie, setCookie } from "../services/CookieService"
import { fetchApi } from "../services/FetchService"
import { NEXT_PUBLIC_API_URL } from "../services/GameManagerService"
import { setProfile, useAuthStore } from "../store"

interface AuthContextType {
  profile: Profile | null
  playAsGuest: () => Promise<Profile | undefined>
  logout: () => void
  login: (email: string, password: string) => Promise<void>
  refreshToken: () => Promise<void>
  register: (props: {
    guestUserId?: string
    email: string
    name: string
    password: string
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  const { profile } = useAuthStore()
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true)
  const toast = useToast()
  const router = useRouter()

  const fetchProfile = async () => {
    const url = `${NEXT_PUBLIC_API_URL}/auth/profile`
    const profile = await fetchApi<Profile>({ url })

    if (isDataResponse(profile)) {
      setProfile(profile)
      return profile
    }

    toast({
      title: "Could not fetch user profile",
      status: "error",
    })
  }

  useEffect(() => {
    const jwt = getCookie("jwt")
    if (!jwt) {
      setLoadingInitial(false)
      router.replace("/welcome")
      return
    }

    fetchProfile().finally(() => {
      setLoadingInitial(false)
    })
  }, [])

  const logout: AuthContextType["logout"] = () => {
    eraseCookie("jwt")
    router.push("/welcome")
    setProfile(null)
  }

  const login: AuthContextType["login"] = async (email, password) => {
    const response = await fetchApi<{ access_token: string }>({
      url: `${NEXT_PUBLIC_API_URL}/auth/login`,
      method: "POST",
      body: {
        email,
        password,
      },
    })

    if (isDataResponse(response)) {
      setCookie("jwt", response.access_token, 30)
      await fetchProfile()
      router.push("/")
      return
    }

    toast({
      title: "Failed to login",
      status: "error",
    })
  }

  const playAsGuest: AuthContextType["playAsGuest"] = async () => {
    const url = `${NEXT_PUBLIC_API_URL}/users/register/guest`
    const response = await fetchApi<AccessTokenResponse>({
      url,
      method: "POST",
    })

    if (isDataResponse(response)) {
      setCookie("jwt", response.access_token, 30)
      return fetchProfile()
    }

    toast({
      title: "Failed to create guest user",
      status: "error",
    })
  }

  const register: AuthContextType["register"] = async (props) => {
    const { guestUserId, email, name, password } = props
    const response = await fetchApi<{ access_token: string }>({
      url: `${NEXT_PUBLIC_API_URL}/users/register`,
      method: "PUT",
      body: { email, name, password, guestUserId },
    })

    if (isDataResponse(response)) {
      setCookie("jwt", response.access_token, 30)
      await fetchProfile()
      router.push("/")
      return
    }

    toast({
      title: "Failed to register",
      status: "error",
    })
  }

  const refreshToken: AuthContextType["refreshToken"] = async () => {
    const response = await fetchApi<{ access_token: string }>({
      url: `${NEXT_PUBLIC_API_URL}/auth/refresh`,
      method: "GET",
    })

    if (isDataResponse(response)) {
      setCookie("jwt", response.access_token, 30)
      await fetchProfile()
      router.push("/")
      return
    }
  }

  const memoedValue = useMemo(
    () => ({
      profile,
      playAsGuest,
      login,
      logout,
      register,
      refreshToken,
    }),
    [profile],
  )

  return (
    <AuthContext.Provider value={memoedValue}>
      {!loadingInitial && children}
    </AuthContext.Provider>
  )
}

export default function useAuth() {
  return useContext(AuthContext)
}
