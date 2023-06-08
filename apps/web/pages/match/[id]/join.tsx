import { Button, Center, Stack, Text, useToast } from "@chakra-ui/react"
import { Match } from "database"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { API_ERROR_CODES, isDataResponse } from "types"
import useAuth from "../../../hooks/useAuth"
import { joinMatch } from "../../../services/MatchService"

const Join = () => {
  const { profile, playAsGuest } = useAuth()
  const [didMount, setDidMount] = useState(false)
  const router = useRouter()
  const toast = useToast()

  const join = async (matchId: Match["id"]) => {
    const response = await joinMatch(matchId)
    if (isDataResponse(response)) {
      router.replace("/match/" + matchId)
      return
    }
    if (response.message === API_ERROR_CODES.CANNOT_JOIN_TWICE) {
      router.replace("/match/" + matchId)
      return
    }
    toast({
      title: "Error",
      description: response.message,
      status: "error",
    })
  }

  const handlePlayAsGuest = async () => {
    const matchId = window.location.pathname.split("/")[2]
    const profile = await playAsGuest()
    if (profile) {
      join(matchId)
    }
  }

  useEffect(() => {
    if (!didMount) {
      setDidMount(true)
    }
  }, [])

  useEffect(() => {
    if (!didMount) {
      return
    }

    const matchId = window.location.pathname.split("/")[2]
    if (profile) {
      join(matchId)
    }
  }, [didMount])

  return (
    <Center w="100vw" h="100vh">
      {profile ? (
        <Text>Joining...</Text>
      ) : (
        <Stack>
          <Button onClick={handlePlayAsGuest}>Play as guest</Button>
          <Button>Login</Button>
        </Stack>
      )}
    </Center>
  )
}

export default Join
