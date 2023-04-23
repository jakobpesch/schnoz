// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

import assert from "assert"
import bcrypt from "bcrypt"
import { prisma } from "../../../prisma/client"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req
  console.log(method, body)

  const { email, password } = body

  if (typeof email !== "string") {
    res.status(400).end(`Invalid email provided: ${email}.`)
    return
  }

  if (typeof password !== "string") {
    res.status(400).end(`Invalid email provided: ${email}.`)
    return
  }

  switch (method) {
    case "POST":
      const user = await prisma.user.findUnique({
        where: { email: email },
      })
      if (!user) {
        res.status(403).end("Invalid credentials")
        break
      }
      assert(user.hash)
      console.log(password, user.hash)
      try {
        const isCorrectPassword = await bcrypt.compare(password, user.hash)
        if (!isCorrectPassword) {
          res.status(403).end("Invalid credentials")
          break
        }
        res
          .status(200)
          .json({ id: user.id, name: user.name, email: user.email })
      } catch (e) {
        res.status(500).end(JSON.stringify(e))
      }
      break
    default:
      res.setHeader("Allow", ["POST"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
