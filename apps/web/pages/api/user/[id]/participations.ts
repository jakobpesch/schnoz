// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

import { prisma } from "../../../../prisma/client"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query, method, body } = req
  console.log(query, method, body)

  const userId = query.id

  if (typeof userId !== "string") {
    res.status(400).end(`Invalid user id provided: ${userId}.`)
    return
  }

  switch (method) {
    case "GET":
      const participants = await prisma.participant.findMany({
        where: { userId: userId },
        include: {
          match: true,
        },
      })

      if (!participants) {
        res.status(404).end("FAIL")
        break
      }

      res.status(200).json(participants)
      break

    default:
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
