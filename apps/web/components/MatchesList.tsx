import { AddIcon, RepeatIcon } from "@chakra-ui/icons"
import {
  Button,
  Center,
  Container,
  IconButton,
  Spacer,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
} from "@chakra-ui/react"
import { MatchStatus } from "database"
import { useRouter } from "next/router"
import { FC, useEffect, useState } from "react"
import {
  API_ERROR_CODES,
  MatchWithPlayersAndUsers,
  isDataResponse,
  isErrorResponse,
} from "types"
import {
  createMatch,
  deleteMatch,
  fetchMatchList,
  joinMatch,
} from "../services/MatchService"
import MatchList from "./MatchList"

export const MatchesList: FC = () => {
  const [matches, setMatches] = useState<MatchWithPlayersAndUsers[]>()
  const [isCreatingMatch, setIsCreatingMatch] = useState(false)
  const router = useRouter()
  const toast = useToast()

  const handleJoinMatch = async (matchId: string) => {
    const response = await joinMatch(matchId)

    if (isDataResponse(response)) {
      router.push("/match/" + matchId)
      return
    }

    if (response.message === API_ERROR_CODES.CANNOT_JOIN_TWICE) {
      router.push("/match/" + matchId)
      return
    }

    toast({
      title: "Error",
      description: response.message,
      status: "error",
    })
  }

  const handleCreateMatch = async () => {
    setIsCreatingMatch(true)
    const response = await createMatch().finally(() => setIsCreatingMatch(true))
    if (isDataResponse(response)) {
      router.push("/match/" + response.id)
      return
    }

    toast({
      title: "Could not create match",
      status: "error",
    })
  }

  const handleDeleteMatch = async (matchId: string) => {
    const deletedMatch = await deleteMatch(matchId)
    if (isErrorResponse(deletedMatch)) {
      toast({
        title: "Could not delete match",
        status: "error",
      })
      return
    }

    if (matches) {
      setMatches([...matches].filter((match) => match.id !== deletedMatch.id))
    }
  }

  const handleGoToMatch = async (matchId: string) => {
    router.push("/match/" + matchId)
  }

  const getMatchList = async () => {
    const response = await fetchMatchList()
    if (isErrorResponse(response)) {
      toast({
        title: "Could not fetch match list",
        status: "error",
      })
      return
    }
    setMatches(response)
  }

  useEffect(() => {
    getMatchList()
  }, [])

  if (!matches) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Stack width="4xl" spacing="4" alignItems="center">
      <Container
        maxWidth="full"
        borderColor="gray.700"
        borderRadius="3xl"
        backgroundColor="gray.900"
        borderWidth="1px"
      >
        {matches && (
          <Tabs width="full" paddingY="4">
            <TabList>
              <Tab>Open</Tab>
              <Tab>Finished</Tab>
              <Spacer />
              <Stack direction="row">
                <IconButton size="sm" onClick={getMatchList} aria-label="">
                  <RepeatIcon />
                </IconButton>
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={handleCreateMatch}
                  leftIcon={<AddIcon />}
                  isLoading={isCreatingMatch}
                >
                  Create Match
                </Button>
              </Stack>
            </TabList>
            <TabPanels>
              <TabPanel>
                <MatchList
                  matches={matches.filter(
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
                  matches={matches.filter(
                    (match) => match.status === MatchStatus.FINISHED
                  )}
                  onJoinClick={(matchId) => handleJoinMatch(matchId)}
                  onDeleteClick={(matchId) => handleDeleteMatch(matchId)}
                  onGoToMatchClick={(matchId) => handleGoToMatch(matchId)}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </Container>
    </Stack>
  )
}
