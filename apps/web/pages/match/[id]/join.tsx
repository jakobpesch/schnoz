import { Center, Text } from "@chakra-ui/react"
import { Match, User } from "database"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import {
  joinMatch,
  signInAnonymously,
} from "../../../services/GameManagerService"
import { useUserId } from "../[id]"

const Join = () => {
  const userId = useUserId()
  const router = useRouter()

  const [isJoining, setIsJoining] = useState(false)
  const join = async (userId: User["id"] | null, matchId: Match["id"]) => {
    if (!userId) {
      const user = await signInAnonymously()
      await joinMatch(matchId, user.id)
      router.push("/match/" + matchId)
      return
    }
    await joinMatch(matchId, userId)
    router.push("/match/" + matchId)
  }
  useEffect(() => {
    if (!isJoining) {
      setIsJoining(true)
    }
  }, [])
  useEffect(() => {
    const matchId = window.location.pathname.split("/")[2]
    if (isJoining) {
      join(userId, matchId)
    }
  }, [isJoining])
  return (
    <Center w="100vw" h="100vh">
      <Text>Joining...</Text>
    </Center>
  )
}

export default Join
