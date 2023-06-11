import {
  Badge,
  Button,
  Container,
  Divider,
  FormControl,
  HStack,
  Heading,
  Input,
  Kbd,
  PinInput,
  PinInputField,
  SimpleGrid,
  Stack,
  Text,
  useClipboard,
  useToast,
} from "@chakra-ui/react"
import { Match, MatchStatus, Participant, User } from "database"
import { NextPage } from "next"
import Link from "next/link"
import { Fragment, useEffect, useState } from "react"
import useSWR, { mutate } from "swr"
import { API_ERROR_CODES, isDataResponse } from "types"
import useAuth from "../../hooks/useAuth"
import { fetchApi } from "../../services/FetchService"
import { BASE_API_URL } from "../../services/GameManagerService"
import { fetcher } from "../../services/swrUtils"

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
  const { profile, register } = useAuth()
  const { participations } = useParticipations(profile?.sub)
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
  const toast = useToast()
  const [friendCode, setFriendCode] = useState<User["friendCode"]>(null)
  const [friends, setFriends] = useState<User[]>([])
  const [incomingFriendRequests, setIncomingFriendRequests] = useState<User[]>(
    []
  )
  const [outgoingFriendRequests, setOutgoingFriendRequests] = useState<User[]>(
    []
  )

  const { onCopy: onCopyFriendCode, hasCopied: hasCopiedFriendCode } =
    useClipboard(profile?.friendCode ?? "")

  useEffect(() => {
    if (profile) {
      fetchApi<User[]>({
        url: `${BASE_API_URL}/users/${profile.sub}/friends`,
        method: "GET",
      }).then((response) => {
        if (isDataResponse(response)) {
          setFriends(response)
          return
        }
        toast({
          title: "Could not fetch friend list",
          status: "warning",
        })
      })
      fetchApi<User[]>({
        url: `${BASE_API_URL}/users/${profile.sub}/incoming-friend-requests`,
        method: "GET",
      }).then((response) => {
        if (isDataResponse(response)) {
          setIncomingFriendRequests(response)
          return
        }
        toast({
          title: "Could not fetch friend list",
          status: "warning",
        })
      })
      fetchApi<User[]>({
        url: `${BASE_API_URL}/users/${profile.sub}/outgoing-friend-requests`,
        method: "GET",
      }).then((response) => {
        if (isDataResponse(response)) {
          setOutgoingFriendRequests(response)
          return
        }
        toast({
          title: "Could not fetch friend list",
          status: "warning",
        })
      })
      setPayload({
        id: profile.sub,
        email: profile.email,
        name: profile.name,
        password: "",
      })
    }
  }, [profile])

  const createAccount = () => {
    if (profile && payload.email && payload.name && payload.password) {
      mutate(async () =>
        register({
          guestUserId: profile.sub,
          email: payload.email!,
          name: payload.name!,
          password: payload.password,
        })
      )
    }
  }

  if (!profile) {
    return null
  }

  const hasAccount = profile.email && profile.name

  const handleAddFriend = async (friendCode: User["friendCode"]) => {
    setFriendCode(null)
    const response = await fetchApi<User[]>({
      url: `${BASE_API_URL}/users/add-friend/${friendCode}`,
      method: "POST",
    })
    if (isDataResponse(response)) {
      toast({
        title: "Success",
        status: "success",
        variant: "subtle",
      })
      return
    }
    if (response.message === API_ERROR_CODES.INVALID_FRIEND_CODE) {
      toast({
        title: "Invalid friend code",
        status: "error",
      })
      return
    }
    if (response.message === API_ERROR_CODES.CANNOT_ADD_SELF_AS_FRIEND) {
      toast({
        title: "You are already your own friend I hope 😊",
        status: "info",
      })
      return
    }
    if (response.message === API_ERROR_CODES.CANNOT_REQUEST_TWICE) {
      toast({
        title: "You already sent a friend request to this user. Be patient!",
        status: "info",
      })
      return
    }
    toast({
      title: "Error",
      status: "error",
    })
  }

  return (
    <Container>
      <Stack py="16" spacing="8">
        <Stack spacing="4">
          {hasAccount ? (
            <>
              <Heading>Profile</Heading>
              <Stack direction={"row"}>
                <Text fontWeight="bold">Name:</Text>
                <Text>{profile.name}</Text>
              </Stack>
              <Stack direction={"row"}>
                <Text fontWeight="bold">Email:</Text>
                <Text>{profile.email}</Text>
              </Stack>
              <Stack direction={"row"}>
                <Text fontWeight="bold">Friend Code:</Text>
                <Text cursor="pointer" onMouseDown={onCopyFriendCode}>
                  {profile.friendCode?.split("").map((char, index) => (
                    <Fragment key={`${char}_${index}`}>
                      <Kbd fontSize="md" userSelect="none">
                        {char}
                      </Kbd>{" "}
                    </Fragment>
                  ))}
                </Text>
                {hasCopiedFriendCode && <Text color="green.400">Copied!</Text>}
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
                  readOnly={!profile || !!profile.email}
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
          {friends.length > 0 && (
            <>
              <Heading size="md">Friends</Heading>
              {friends.map((friend) => (
                <Stack key={friend.id} direction={"row"}>
                  <Text>{friend.name}</Text>
                </Stack>
              ))}
            </>
          )}
          {incomingFriendRequests.length > 0 && (
            <>
              <Heading size="md">Incoming Friend Requests</Heading>
              {incomingFriendRequests.map((friendRequest) => (
                <Stack key={`${friendRequest.id}_incoming`} direction={"row"}>
                  <Text>{friendRequest.name}</Text>
                  <Button
                    size="xs"
                    onClick={() => handleAddFriend(friendRequest.friendCode)}
                  >
                    Accept
                  </Button>
                </Stack>
              ))}
            </>
          )}
          {outgoingFriendRequests.length > 0 && (
            <>
              <Heading size="md">Outgoing Friend Requests</Heading>
              {outgoingFriendRequests.map((friendRequest) => (
                <Stack key={`${friendRequest.id}_outgoing`} direction={"row"}>
                  <Text>{friendRequest.name}</Text>
                </Stack>
              ))}
            </>
          )}
        </Stack>

        <Stack direction="row">
          <HStack>
            <PinInput
              onChange={(friendCode) => {
                setFriendCode(friendCode)
              }}
              otp
              type="alphanumeric"
            >
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
            </PinInput>
          </HStack>
          <Button
            disabled={friendCode?.length !== 4}
            onClick={() => handleAddFriend(friendCode)}
          >
            Add Friend
          </Button>
        </Stack>
        <Stack spacing="4">
          <Heading>Match History</Heading>
          {participations?.length === 0 ? (
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
