import { NextPage } from "next"
import { useEffect } from "react"
import useAuth from "../../hooks/useAuth"
import { Spinner } from "@chakra-ui/react"
import { useRouter } from "next/router"
import { NEXT_PUBLIC_CLIENT_URL } from "../../services/GameManagerService"

const Verified: NextPage = () => {
  const { refreshToken, logout } = useAuth()
  const router = useRouter()
  refreshToken()
    .then(() => {
      router.push(NEXT_PUBLIC_CLIENT_URL + "/account")
    })
    .catch(() => {
      logout()
    })
  return <Spinner />
}
export default Verified
