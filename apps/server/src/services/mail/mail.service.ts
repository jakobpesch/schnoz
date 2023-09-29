import { Injectable, InternalServerErrorException } from "@nestjs/common"
import nodemailer from "nodemailer"

console.log("process.env.MAIL_HOST", process.env.MAIL_HOST)

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST ?? "",
  port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT) : 465,
  secure: true,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD },
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
    try {
      const info = await transporter.sendMail({
        from: '"Schnoz" <support@schnoz.lol>',
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        text,
        html,
      })
      console.log("Message sent: %s", info.messageId)
    } catch (error) {
      console.log("Could not send email", error)
      new InternalServerErrorException()
    }
  }
}
