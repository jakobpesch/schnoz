// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../../../prisma/client"
export type MatchCheckResponseData = { hasUpdate: boolean }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MatchCheckResponseData>
) {
  const { query, method } = req
  const { id: matchId, time: updatedAtOnClient } = req.query

  if (typeof matchId !== "string") {
    res.status(400).end(`Invalid match id provided: ${matchId}.`)
    return
  }

  if (typeof updatedAtOnClient !== "string") {
    res.status(400).end("Invalid query parameter 'time'")
    return
  }

  switch (method) {
    case "GET":
      const match = await prisma.match.findUnique({
        where: { id: matchId },
      })

      if (match === null) {
        res.status(404).end("Could not find match")
        break
      }

      if (new Date(updatedAtOnClient) < new Date(match.updatedAt)) {
        res.status(200).json({ hasUpdate: true })
        break
      }

      res.status(200).json({ hasUpdate: false })
      break
    default:
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
