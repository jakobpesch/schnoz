// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../prisma/client"
import bcrypt from "bcrypt"
import { faker } from "@faker-js/faker"
const saltRounds = 10
function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { body, method } = req
  switch (method) {
    case "POST":
      const { name, email, password } = body
      if (!name && !email && !password) {
        const adjective = capitalize(
          faker.word.adjective({ length: { min: 3, max: 6 } })
        )
        const noun = capitalize(faker.word.noun({ length: { min: 3, max: 6 } }))

        // sign in anonymously
        const user = await prisma.user.create({
          data: { name: adjective + " " + noun },
        })
        res.status(201).json(user)
      } else if (name && email && password) {
        const salt = await bcrypt.genSalt(saltRounds)
        const hash = await bcrypt.hash(password, salt)
        const user = await prisma.user.create({
          data: {
            name,
            email,
            hash,
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
        })
        res.status(201).json(user)
      } else {
        res.status(404).end("User query incomplete")
      }
      break
    default:
      res.setHeader("Allow", ["POST"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
