// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../../../prisma/client"
import { matchRichInclude } from "../../../../types/Match"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req
  const matchId = query.id

  if (typeof matchId !== "string") {
    res.status(400).end(`Invalid match id provided: ${matchId}.`)
    return
  }

  switch (method) {
    case "GET":
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: matchRichInclude,
      })
      if (!match) {
        res.status(404).end(`Match with id ${matchId} not found.`)
        break
      }

      res.status(200).json(match)
      break
    default:
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
