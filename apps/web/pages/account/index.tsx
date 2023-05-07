import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import { Match, MatchStatus, Participant, User } from "database"
import { NextPage } from "next"
import Link from "next/link"
import { useEffect, useState } from "react"
import useSWR, { mutate } from "swr"
import { getCookie } from "../../services/CookieService"
import { registerUser } from "../../services/GameManagerService"
import { fetcher } from "../../services/swrUtils"

//@ts-ignore
async function sendReupdateUserquest(url, { arg }) {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(arg),
  }).then((res) => res.json())
}
export const useUser = () => {
  const { data, error, isLoading, isValidating, mutate } = useSWR<User>(() => {
    const userId = getCookie("userId")
    return "/api/user/" + userId
  }, fetcher)

  return {
    user: data,
    isLoading,
    isAnonymous: !data?.email || !data.name,
    isError: error,
    isValidating,
    mutate,
  }
}

function useParticipations(userId?: string) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    (Participant & { match: Match })[]
  >(
    () => {
      if (!userId) {
        throw new Error("No id")
      }
      return `/api/user/${userId}/participations`
    },
    fetcher,
    { revalidateOnFocus: false }
  )

  return {
    participations: data,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  }
}

const UserPage: NextPage = () => {
  const { user } = useUser()
  const { participations } = useParticipations(user?.id)
  const [payload, setPayload] = useState<{
    id: User["id"]
    name: User["name"]
    email: User["email"]
    password: string
  }>({
    id: "",
    name: null,
    email: null,
    password: "",
  })
  useEffect(() => {
    if (user) {
      setPayload({ ...user, password: "" })
    }
  }, [user])

  const createAccount = () => {
    if (user && payload.email && payload.name && payload.password) {
      mutate(
        async () =>
          await registerUser(user.id, {
            email: payload.email!,
            name: payload.name!,
            password: payload.password,
          })
      )
    }
  }

  if (!user || !participations) {
    return null
  }

  const hasAccount = user.email && user.name

  return (
    <Container>
      <Stack py="16" spacing="8">
        <Stack spacing="4">
          {hasAccount ? (
            <>
              <Heading>Profile</Heading>
              <Stack direction={"row"}>
                <Text fontWeight="bold">Name:</Text>
                <Text>{user.name}</Text>
              </Stack>
              <Stack direction={"row"}>
                <Text fontWeight="bold">Email:</Text>
                <Text>{user.email}</Text>
              </Stack>
            </>
          ) : (
            <>
              <Heading>Want to sign up?</Heading>
              <Text>
                You are currently playing anonymously. If you want to keep your
                match history, enter your name and email to create an account.
              </Text>
            </>
          )}

          {!hasAccount && (
            <>
              <FormControl>
                {/* <FormLabel>Name</FormLabel> */}
                <Input
                  variant="outline"
                  placeholder="Name"
                  type="text"
                  value={payload.name ?? ""}
                  onChange={(e) => {
                    setPayload({ ...payload, name: e.target.value })
                  }}
                />
                {/* <FormHelperText>Your user name</FormHelperText> */}
              </FormControl>
              <FormControl>
                {/* <FormLabel>Name</FormLabel> */}
                <Input
                  variant="outline"
                  placeholder="Email"
                  type="email"
                  readOnly={!user || !!user.email}
                  value={payload.email ?? ""}
                  onChange={(e) => {
                    setPayload({ ...payload, email: e.target.value })
                  }}
                />
                {/* <FormHelperText>We'll never share your email.</FormHelperText> */}
              </FormControl>
              <FormControl>
                {/* <FormLabel>Name</FormLabel> */}
                <Input
                  variant="outline"
                  placeholder="Password"
                  type="password"
                  value={payload.password ?? ""}
                  onChange={(e) => {
                    setPayload({ ...payload, password: e.target.value })
                  }}
                />
                {/* <FormHelperText>Your user name</FormHelperText> */}
              </FormControl>
              <Button
                disabled={!payload.email || !payload.name}
                type="submit"
                onClick={createAccount}
              >
                Create account
              </Button>
            </>
          )}
        </Stack>
        <Stack spacing="4">
          <Heading>Match History</Heading>
          {participations.length === 0 ? (
            <Text>{"You haven't played in any matches yet."}</Text>
          ) : (
            <SimpleGrid gap="2" columns={4} alignItems="center">
              <Text fontWeight="bold">Created at</Text>
              <Text fontWeight="bold">Status</Text>
              <Text fontWeight="bold">Outcome</Text>
              <Text fontWeight="bold">Match</Text>
              <Divider />
              <Divider />
              <Divider />
              <Divider />
              {participations?.map((participant) => {
                const [date, time] = new Date(participant.match.createdAt)
                  .toLocaleString()
                  .split(", ")
                return (
                  <>
                    <Text whiteSpace="pre-wrap">
                      {date + "\n" + time.slice(0, 5)}
                    </Text>
                    <Text whiteSpace="pre-wrap">
                      <Badge
                        colorScheme={
                          participant.match.status === MatchStatus.CREATED
                            ? "orange"
                            : participant.match.status === MatchStatus.STARTED
                            ? "green"
                            : "gray"
                        }
                      >
                        {participant.match.status}
                      </Badge>
                    </Text>
                    {participant.match.finishedAt === null ? (
                      <Text color="gray.400">-</Text>
                    ) : participant.match.winnerId === null ? (
                      <Text color="gray.400">Draw</Text>
                    ) : participant.match.winnerId === participant.id ? (
                      <Text color="green.400">Win</Text>
                    ) : (
                      <Text color="red.400">Loss</Text>
                    )}
                    <Button width="min-content" variant="link">
                      <Link href={"/match/" + participant.matchId}>Show</Link>
                    </Button>
                    <Divider />
                    <Divider />
                    <Divider />
                    <Divider />
                  </>
                )
              })}
            </SimpleGrid>
          )}
        </Stack>
      </Stack>
    </Container>
  )
}

export default UserPage
