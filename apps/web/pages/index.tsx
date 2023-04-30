import { AddIcon, RepeatIcon } from "@chakra-ui/icons"
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  FormControl,
  HStack,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { MatchStatus } from "database"
import { Formik } from "formik"
import type { NextPage } from "next"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { MatchWithPlayers } from "types"
import KoFiLogo from "../assets/images/kofi_logo.png"
import MatchList from "../components/MatchList"
import { eraseCookie, getCookie, setCookie } from "../services/CookieService"
import {
  createMatch,
  deleteMatch,
  joinMatch,
  login,
  signInAnonymously,
} from "../services/GameManagerService"
import { fetcher } from "../services/swrUtils"
import { useUser } from "./account"

const Home: NextPage = () => {
  const router = useRouter()
  const [status, setStatus] = useState("")
  const { user, isAnonymous, isError: error, mutate: userMutate } = useUser()
  const [isCreatingMatch, setIsCreatingMatch] = useState(false)
  const [loginDialog, setLoginDialog] = useState(false)
  const [loginPayload, setLoginPayload] = useState({ email: "", password: "" })

  useEffect(() => {
    const userCookie = getCookie("userId")
    if (!userCookie || error?.cause?.status === 404) {
      userMutate(signInAnonymously)
    }
  }, [error?.cause?.status])

  const {
    data: matches,
    error: isError,
    isLoading: isLoadingInitially,
    isValidating,
    mutate,
  } = useSWR<MatchWithPlayers[]>("/api/matches", fetcher)

  if (!user) {
    return null
  }

  const handleJoinMatch = async (matchId: string) => {
    if (!user) {
      return
    }
    try {
      await joinMatch(matchId, user.id)
      setStatus("Joined match")
      router.push("/match/" + matchId)
    } catch (e: any) {
      setStatus(e.message)
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
      setIsCreatingMatch(false)
      setStatus(e.message)
    }
  }

  const handleDeleteMatch = async (matchId: string) => {
    try {
      if (!user) {
        return
      }
      await deleteMatch(matchId, user.id)
      setStatus("Deleted match: " + matchId.slice(-5))
      mutate()
    } catch (e: any) {
      setStatus(e.message)
    }
  }

  const handleGoToMatch = async (matchId: string) => {
    try {
      if (!user) {
        return
      }
      router.push("/match/" + matchId)
    } catch (e: any) {
      setStatus(e.message)
    }
  }

  const handleLogout = () => {
    eraseCookie("userId")
    router.push("/")
  }

  const handleRegister = () => {
    router.push("/account")
  }

  const handleLogin = async (
    email: typeof loginPayload.email,
    password: typeof loginPayload.password
  ) => {
    return await userMutate(async () => {
      try {
        const signedInUser = await login({ email, password })
        setCookie("userId", signedInUser.id, 30)
        router.push("/")
        return signedInUser
      } catch (e: any) {
        console.log(e.cause)
        return user
      }
    })
  }

  const sortedMatches = !matches
    ? []
    : [...matches].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

  return (
    <Flex pt="16" width="full" height="100vh" justify="center">
      <Text position="absolute" bottom="4" right="4">
        {status}
      </Text>

      <Stack width="4xl" spacing="4" alignItems="center">
        <Heading fontFamily="Geodesic" fontSize="90px" color="teal.700">
          schnozzz
        </Heading>
        <Stack direction="row">
          <Button
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
          >
            Refresh
          </Button>
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
                  <Tab>All</Tab>
                  <Tab>Open</Tab>
                  <Tab>Ongoing</Tab>
                  <Tab>Finished</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <MatchList
                      userId={user.id}
                      matches={sortedMatches}
                      onJoinClick={(matchId) => handleJoinMatch(matchId)}
                      onDeleteClick={(matchId) => handleDeleteMatch(matchId)}
                      onGoToMatchClick={(matchId) => handleGoToMatch(matchId)}
                    />
                  </TabPanel>
                  <TabPanel>
                    <MatchList
                      userId={user.id}
                      matches={sortedMatches.filter(
                        (match) => match.status === MatchStatus.CREATED
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
                        (match) => match.status === MatchStatus.STARTED
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

      <HStack position="fixed" top="4" right="4">
        {isAnonymous ? (
          <HStack>
            <Button onClick={handleRegister}>Register</Button>
            <Button onClick={() => setLoginDialog(true)}>Login</Button>
            <Modal
              isOpen={loginDialog}
              onClose={() => {
                setLoginDialog(false)
              }}
            >
              <ModalContent>
                <ModalHeader>Login</ModalHeader>
                <ModalCloseButton />
                <Formik
                  initialValues={{ email: "", password: "" }}
                  validate={(values) => {
                    const errors: { email?: string; password?: string } = {}
                    if (!values.email) {
                      errors.email = "Required"
                    } else if (
                      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
                        values.email
                      )
                    ) {
                      errors.email = "Invalid email address"
                    }
                    return errors
                  }}
                  onSubmit={async (values, { setSubmitting, setStatus }) => {
                    const loggedInUser = await handleLogin(
                      values.email,
                      values.password
                    )
                    if (!loggedInUser?.email) {
                      setStatus("Invalid credentials")
                    }
                    setSubmitting(false)
                  }}
                >
                  {({
                    values,
                    errors,
                    touched,
                    status,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                    /* and other goodies */
                  }) => (
                    <form onSubmit={handleSubmit}>
                      <ModalBody>
                        <Stack>
                          <FormControl>
                            <Input
                              type="email"
                              name="email"
                              placeholder="Email"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.email}
                            />
                          </FormControl>
                          <Text>
                            {errors.email && touched.email && errors.email}
                          </Text>
                          <FormControl>
                            <Input
                              type="password"
                              name="password"
                              placeholder="Password"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.password}
                            />
                          </FormControl>
                          <Text>
                            {errors.password &&
                              touched.password &&
                              errors.password}
                          </Text>
                          <Text>{status}</Text>
                        </Stack>
                      </ModalBody>
                      <ModalFooter>
                        <FormControl>
                          <Button type="submit" disabled={isSubmitting}>
                            Submit
                          </Button>
                        </FormControl>
                      </ModalFooter>
                    </form>
                  )}
                </Formik>
              </ModalContent>
            </Modal>
          </HStack>
        ) : (
          <HStack>
            <Text fontSize="xl">Hello, {user.name}!</Text>

            <Link href="/account">
              <Button>Account</Button>
            </Link>

            <Button onClick={handleLogout}>Log out</Button>
          </HStack>
        )}
        <Tooltip
          shouldWrapChildren
          hasArrow
          placement="bottom"
          label="Buy me a coffee"
        >
          <Link href="https://ko-fi.com/I2I1FR7RZ">
            <Box cursor="pointer">
              <Image
                src={KoFiLogo}
                alt="Buy Me a Coffee at ko-fi.com"
                width="32"
                height="32"
              />
            </Box>
          </Link>
        </Tooltip>
      </HStack>
    </Flex>
  )
}

export default Home
