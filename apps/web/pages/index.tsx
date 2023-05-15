import { AddIcon, RepeatIcon } from "@chakra-ui/icons"
import {
  Button,
  Center,
  Container,
  Flex,
  HStack,
  Heading,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react"
import { MatchStatus } from "database"
import type { NextPage } from "next"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { MatchWithPlayers, UserWithoutHash } from "types"
import { DonateButton } from "../components/DonateButton"
import MatchList from "../components/MatchList"
import { eraseCookie, getCookie } from "../services/CookieService"
import {
  BASE_API_URL,
  createMatch,
  deleteMatch,
  joinMatch,
  registerGuestUser,
} from "../services/GameManagerService"
import { fetcher } from "../services/swrUtils"

const Home: NextPage = () => {
  const router = useRouter()
  const [user, setUser] = useState<UserWithoutHash>()
  const [isLoading, setIsLoading] = useState(true)

  // const { user, isAnonymous, isError: error, mutate: userMutate } = useUser()
  const [isCreatingMatch, setIsCreatingMatch] = useState(false)

  const fetchUser = async (jwt: string) => {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwt,
      },
    }
    try {
      setIsLoading(true)
      const response = await fetch(`${BASE_API_URL}/auth/profile`, options)
      const json = await response.json()
      const UNAUTHORIZED = 401
      if (json.statusCode === UNAUTHORIZED) {
        eraseCookie("jwt")
        return
      }
      setUser(json)
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const jwt = getCookie("jwt")
    if (!jwt) {
      return
    }
    fetchUser(jwt)
  }, [])

  const {
    data: matches,
    error: isError,
    isLoading: isLoadingInitially,
    isValidating,
    mutate,
  } = useSWR<MatchWithPlayers[]>("/api/matches", fetcher)
  const handleJoinMatch = async (matchId: string) => {
    if (!user) {
      return
    }
    try {
      await joinMatch(matchId, user.id)
      router.push("/match/" + matchId)
    } catch (e: any) {
      throw e
    }
  }

  const handleCreateMatch = async () => {
    try {
      if (!user) {
        return
      }
      setIsCreatingMatch(true)
      const match = await createMatch(user.id)
      router.push("/match/" + match.id)
    } catch (e: any) {
      throw e
    } finally {
      setIsCreatingMatch(false)
    }
  }

  const handleDeleteMatch = async (matchId: string) => {
    try {
      if (!user) {
        return
      }
      await deleteMatch(matchId, user.id)
      mutate()
    } catch (e: any) {
      throw e
    }
  }

  const handleGoToMatch = async (matchId: string) => {
    try {
      if (!user) {
        return
      }
      router.push("/match/" + matchId)
    } catch (e: any) {
      throw e
    }
  }

  const handleLogout = () => {
    eraseCookie("jwt")
    setUser(undefined)
  }

  const sortedMatches = !matches
    ? []
    : [...matches].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  const isGuestUser = user?.email === null
  const MatchesList = () => (
    <Stack width="4xl" spacing="4" alignItems="center">
      <Stack direction="row">
        <Button
          colorScheme="blue"
          size="sm"
          onClick={handleCreateMatch}
          leftIcon={<AddIcon />}
          isLoading={isCreatingMatch}
        >
          Create Match
        </Button>
        <Button
          disabled={isLoadingInitially}
          isLoading={isValidating}
          size="sm"
          onClick={() => mutate()}
          leftIcon={<RepeatIcon />}
        ></Button>
      </Stack>
      <Container
        maxWidth="full"
        borderColor="gray.700"
        borderRadius="lg"
        bg="gray.900"
        borderWidth="4px"
      >
        {isLoadingInitially ? (
          <Center height="md">
            <Spinner />
          </Center>
        ) : (
          matches &&
          user && (
            <Tabs align="center" width="full" py="4">
              <TabList>
                <Tab>Open</Tab>
                <Tab>Finished</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <MatchList
                    userId={user.id}
                    matches={sortedMatches.filter(
                      (match) =>
                        match.status === MatchStatus.CREATED ||
                        match.status === MatchStatus.STARTED
                    )}
                    onJoinClick={(matchId) => handleJoinMatch(matchId)}
                    onDeleteClick={(matchId) => handleDeleteMatch(matchId)}
                    onGoToMatchClick={(matchId) => handleGoToMatch(matchId)}
                  />
                </TabPanel>
                <TabPanel>
                  <MatchList
                    userId={user.id}
                    matches={sortedMatches.filter(
                      (match) => match.status === MatchStatus.FINISHED
                    )}
                    onJoinClick={(matchId) => handleJoinMatch(matchId)}
                    onDeleteClick={(matchId) => handleDeleteMatch(matchId)}
                    onGoToMatchClick={(matchId) => handleGoToMatch(matchId)}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          )
        )}
      </Container>
    </Stack>
  )

  const handlePlayAsGuest = async () => {
    const jwt = await registerGuestUser()
    await fetchUser(jwt)
  }

  const TopMenu = () => (
    <HStack position="fixed" top="4" right="4">
      <HStack>
        <Text fontSize="xl">Hello, {user?.name}!</Text>
        <Link href="/account">
          <Button>{isGuestUser ? "Create account" : "Account"}</Button>
        </Link>
        {!isGuestUser && <Button onClick={handleLogout}>Log out</Button>}
      </HStack>

      <DonateButton />
    </HStack>
  )

  const Login = () => (
    <Stack>
      <HStack>
        <Button onClick={() => handlePlayAsGuest()}>Play as guest</Button>
        <Button>
          <Link href="/login">Login</Link>
        </Button>
      </HStack>
      <Button colorScheme="blue">
        <Link href="/register">Sign up</Link>
      </Button>
    </Stack>
  )

  // const cookie = getCookie("userId")
  // const hasCookie = cookie != null

  return (
    <Flex
      flexDir="column"
      pt="100"
      width="full"
      height="100vh"
      justify="start"
      align="center"
    >
      <Heading fontFamily="Geodesic" fontSize="90px" color="teal.300">
        schnoz
      </Heading>
      {user ? (
        <>
          <MatchesList />
          <TopMenu />
        </>
      ) : (
        <Login />
      )}
    </Flex>
  )
}

export default Home
