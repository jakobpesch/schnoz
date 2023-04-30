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
import { MatchWithPlayers } from "types"
import { MinusIcon } from "@chakra-ui/icons"

interface MatchListProps {
  userId: string
  matches: MatchWithPlayers[]
  onJoinClick: (id: string) => void
  onDeleteClick: (id: string) => void
  onGoToMatchClick: (id: string) => void
}

const MatchList = (props: MatchListProps) => {
  const { userId, matches, onJoinClick, onDeleteClick, onGoToMatchClick } =
    props
  const canJoin = (match: MatchWithPlayers) => {
    return (
      match.players.length === 1 &&
      !match.players.some((player) => player.userId === userId)
    )
  }
  const canDelete = (match: MatchWithPlayers, userId: string) => {
    return match.createdById === userId
  }
  const hasJoined = (match: MatchWithPlayers, userId: string) => {
    return match.players.some((participant) => participant.userId === userId)
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
            <Th>Match ID</Th>
            <Th>Status</Th>
            <Th>Created by</Th>
            <Th>Players</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {matches?.map((match) => {
            const [date, time] = new Date(match.createdAt)
              .toLocaleString()
              .split(", ")
            return (
              <Tr key={match.id}>
                <Td>
                  <Text>{date}</Text>
                  <Text>{time}</Text>
                </Td>
                <Td>{match.id.slice(-5)}</Td>
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
                <Td>
                  {match.createdById === userId
                    ? "Me"
                    : match.createdById.slice(-5)}
                </Td>
                <Td>{match.players.length} / 2</Td>

                <Td>
                  <HStack>
                    {canJoin(match) && (
                      <Button
                        variant="link"
                        // disabled={!canJoin(match)}
                        onClick={() => onJoinClick(match.id)}
                      >
                        Join
                      </Button>
                    )}
                    {canDelete(match, userId) && (
                      <Button
                        variant="link"
                        // disabled={!canDelete(match, userId)}
                        onClick={() => onDeleteClick(match.id)}
                      >
                        Delete
                      </Button>
                    )}
                    {hasJoined(match, userId) && (
                      <Button
                        variant="link"
                        // disabled={!hasJoined(match, userId)}
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
