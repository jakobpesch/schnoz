// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import assert from "assert"
import { shuffleArray } from "coordinate-utils"
import { Match, MatchStatus, Participant, UnitConstellation } from "database"
import type { NextApiRequest, NextApiResponse } from "next"
import { API_ERROR_CODES, matchRich } from "types"
import { prisma } from "../../../services/PrismaService"

const checkConditionsForJoining = (
  participants: Participant[],
  userId: string
) => {
  if (participants.some((participant) => participant.userId === userId)) {
    return { error: API_ERROR_CODES.CANNOT_JOIN_TWICE }
  }
  if (participants.length === 2) {
    return { error: "Match already full" }
  }
  return { error: null }
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { body, method } = req
  let match: Match | null
  const matchId = req.query.id

  if (typeof matchId !== "string") {
    res.status(404).end(`Invalid match id provided: ${matchId}.`)
    return
  }

  switch (method) {
    case "PUT":
      const richMatch = await prisma.match.findUnique({
        where: { id: matchId },
        ...matchRich,
      })
      if (richMatch === null) {
        res.status(404).end(`Match with id ${matchId} not found.`)
        return
      }
      if (richMatch.gameSettings === null) {
        res.status(500).end("Settings missing")
        return
      }

      switch (body.action) {
        case "join":
          const { error: joinError } = checkConditionsForJoining(
            richMatch.players,
            body.userId
          )

          if (joinError) {
            res.status(500).json({ error: joinError })
            break
          }

          const joinedMatch = await prisma.match.update({
            where: { id: matchId },
            data: {
              players: { create: { userId: body.userId, playerNumber: 1 } },
              updatedAt: new Date(),
              logs: {
                create: {
                  message: `Player ${body.userId} joined the match`,
                },
              },
            },
            ...matchRich,
          })
          res.status(200).json(joinedMatch)
          break

        case "start":
          // const { error: startError } = checkConditionsForCreation(
          //   richMatch,
          //   body.userId
          // )

          // if (startError) {
          //   res.status(500).end(startError)
          //   break
          // }

          const status = MatchStatus.STARTED
          const startedAt = new Date()

          const activePlayerId = richMatch.players.find(
            (player) => player.userId === body.userId
          )?.id

          assert(activePlayerId)

          const openCards = shuffleArray<UnitConstellation>(
            Object.values({ ...UnitConstellation })
          ).slice(0, 3)

          const turn = 1

          console.time("updateMatch")
          const startedMatch = await prisma.match.update({
            where: { id: richMatch.id },
            data: {
              openCards,
              status,
              startedAt,
              activePlayerId,
              turn,
            },
            ...matchRich,
          })
          console.timeEnd("updateMatch")

          res.status(200).json(startedMatch)
          break
        default:
          res.status(500).end("Possible PUT actions: 'join', 'start'")
      }
      break
    case "DELETE":
      const deletedMatch = await prisma.match.delete({ where: { id: matchId } })

      if (!deletedMatch) {
        res.status(500).end("Match could not be deleted")
        break
      }
      res.status(200).json(deletedMatch)
      break
    case "GET":
      match = await prisma.match.findUnique({
        where: { id: matchId },
      })
      if (!match) {
        res.status(404).end(`Match with id ${matchId} not found.`)
        break
      }

      res.status(200).json(match)
      break
    default:
      res.setHeader("Allow", ["PUT", "GET", "DELETE"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
