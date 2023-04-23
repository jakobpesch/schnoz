import { MatchStatus } from "database"
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../../../prisma/client"
import { MatchRich, matchRichInclude } from "../../../../types/Match"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MatchRich>
) {
  const { body, method, query } = req
  let match: MatchRich | null
  const {
    participantId,
    mapSize,
    rules,
    maxTurns,
    waterRatio,
    treeRatio,
    stoneRatio,
  } = body
  const { id: matchId } = query

  if (!participantId && !(mapSize || rules)) {
    res.status(400).end("Query is not complete")
    return
  }

  if (typeof matchId !== "string") {
    res.status(404).end(`Invalid match id provided: ${matchId}.`)
    return
  }

  switch (method) {
    case "PUT":
      // Create a new move
      match = await prisma.match.findUnique({
        where: { id: matchId },
        include: matchRichInclude,
      })

      if (match === null) {
        res.status(500).end("Could not find match")
        break
      }
      if (match.status !== MatchStatus.CREATED) {
        res.status(500).end("Cannot change settings of already started match")
        break
      }

      const updatedMatch = await prisma.match.update({
        where: { id: match.id },
        data: {
          gameSettings: {
            update: {
              mapSize,
              rules,
              maxTurns,
              waterRatio,
              stoneRatio,
              treeRatio,
            },
          },
          updatedAt: new Date(),
        },
        include: matchRichInclude,
      })

      res.status(201).json(updatedMatch)
      break
    default:
      res.setHeader("Allow", ["PUT"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
