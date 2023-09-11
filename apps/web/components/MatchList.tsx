import { MinusIcon } from "@chakra-ui/icons"
import {
  Badge,
  Button,
  Heading,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { MatchStatus } from "database"
import { MatchWithPlayersAndUsers } from "types"
import useAuth from "../hooks/useAuth"
import { getRelativeTime } from "../services/DateService"

interface MatchListProps {
  matches: MatchWithPlayersAndUsers[]
  onJoinClick: (id: string) => void
  onDeleteClick: (id: string) => void
  onGoToMatchClick: (id: string) => void
}

const MatchList = (props: MatchListProps) => {
  const { profile } = useAuth()
  const { matches, onJoinClick, onDeleteClick, onGoToMatchClick } = props
  const canJoin = (match: MatchWithPlayersAndUsers) => {
    return (
      match.players.length === 1 &&
      !match.players.some((player) => player.userId === profile?.sub)
    )
  }
  const canDelete = (match: MatchWithPlayersAndUsers) => {
    return match.createdById === profile?.sub
  }
  const hasJoined = (match: MatchWithPlayersAndUsers) => {
    return match.players.some(
      (participant) => participant.userId === profile?.sub,
    )
  }
  if (matches.length === 0) {
    return (
      <Heading p={10} textAlign="center" color="gray.500">
        <MinusIcon />
      </Heading>
    )
  }

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Created</Th>
            <Th>Status</Th>
            <Th>Created by</Th>
            <Th>Players</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {matches?.map((match) => {
            const relativeTime = getRelativeTime(match.createdAt)
            const createdByName = match.players.find(
              (player) => match.createdById === player.userId,
            )?.user.name
            return (
              <Tr key={match.id}>
                <Td>
                  <Text>{relativeTime}</Text>
                </Td>

                <Td>
                  <Badge
                    colorScheme={
                      match.status === MatchStatus.CREATED
                        ? "orange"
                        : match.status === MatchStatus.STARTED
                        ? "green"
                        : "gray"
                    }
                  >
                    {match.status}
                  </Badge>
                </Td>
                <Td>{createdByName}</Td>
                <Td>{match.players.length} / 2</Td>

                <Td>
                  <HStack>
                    {canJoin(match) && (
                      <Button
                        variant="link"
                        onClick={() => onJoinClick(match.id)}
                      >
                        Join
                      </Button>
                    )}
                    {canDelete(match) && (
                      <Button
                        variant="link"
                        onClick={() => onDeleteClick(match.id)}
                      >
                        Delete
                      </Button>
                    )}
                    {hasJoined(match) && (
                      <Button
                        variant="link"
                        onClick={() => onGoToMatchClick(match.id)}
                      >
                        Go to match
                      </Button>
                    )}
                  </HStack>
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

export default MatchList
