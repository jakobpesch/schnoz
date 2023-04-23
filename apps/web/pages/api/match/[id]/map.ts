// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../../../prisma/client"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req
  const mapId = query.id

  if (typeof mapId !== "string") {
    res.status(400).end(`Invalid map id provided: ${mapId}.`)
    return
  }

  switch (method) {
    case "GET":
      const map = await prisma.map.findUnique({
        where: { id: mapId },
        include: { tiles: { include: { unit: true } } },
      })
      if (!map) {
        res.status(404).end(`Match with id ${mapId} not found.`)
        break
      }

      res.status(200).json(map)
      break
    default:
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
