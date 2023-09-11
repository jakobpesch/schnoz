import { Injectable } from "@nestjs/common"
import dotenv from "dotenv"
import nodemailer from "nodemailer"

const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD } =
  dotenv.config()?.parsed ?? {}

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: parseInt(MAIL_PORT),
  secure: true,
  auth: { user: MAIL_USER, pass: MAIL_PASSWORD },
})

@Injectable()
export class MailService {
  async sendMail(args: {
    to: string | string[]
    subject: string
    text: string
    html: string
  }) {
    const { to, subject, text, html } = args
    const info = await transporter.sendMail({
      from: '"Schnoz" <support@schnoz.lol>',
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      text,
      html,
    })
    console.log("Message sent: %s", info.messageId)
  }
}
