// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Rule } from "database"
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../prisma/client"
import { matchRichInclude } from "../../types/Match"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { body, method } = req

  switch (method) {
    case "POST":
      const match = await prisma.match.create({
        data: {
          createdById: body.userId,
          maxPlayers: 2,
          gameSettings: { create: { mapSize: 11, rules: Object.values(Rule) } },
          players: {
            create: {
              userId: body.userId,
              playerNumber: 0,
            },
          },
          logs: {
            create: {
              message: "Match created by " + body.userId,
            },
          },
        },
        include: matchRichInclude,
      })
      res.status(201).json(match)
      break
    case "GET":
      const matches = await prisma.match.findMany({
        include: { players: true },
      })
      res.status(200).json(matches)
      break
    default:
      res.setHeader("Allow", ["POST", "GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
