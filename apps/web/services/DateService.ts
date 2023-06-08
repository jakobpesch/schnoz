const SECONDS_MILLISECONDS = 1000
const MINUTES_MILLISECONDS = SECONDS_MILLISECONDS * 60
const HOURS_MILLISECONDS = MINUTES_MILLISECONDS * 60
const DAY_MILLISECONDS = HOURS_MILLISECONDS * 24
const WEEK_MILLISECONDS = DAY_MILLISECONDS * 7
const MONTHS_MILLISECONDS = WEEK_MILLISECONDS * (52 / 12)

export function getRelativeTime(timestamp: string | Date) {
  const rtf = new Intl.RelativeTimeFormat("en-US", {
    numeric: "auto",
  })
  const msDifference = new Date(timestamp).getTime() - new Date().getTime()

  const seconds = msDifference / SECONDS_MILLISECONDS
  const minutes = msDifference / MINUTES_MILLISECONDS
  const hours = msDifference / HOURS_MILLISECONDS
  const days = msDifference / DAY_MILLISECONDS
  const weeks = msDifference / WEEK_MILLISECONDS
  const months = msDifference / MONTHS_MILLISECONDS

  let dateText = rtf.format(Math.round(seconds), "seconds")
  if (Math.abs(seconds) >= 60) {
    dateText = rtf.format(Math.round(minutes), "minutes")
  }
  if (Math.abs(minutes) >= 60) {
    dateText = rtf.format(Math.round(hours), "hours")
  }
  if (Math.abs(hours) >= 1) {
    dateText = rtf.format(Math.round(days), "days")
  }
  if (Math.abs(days) >= 7) {
    dateText = rtf.format(Math.round(weeks), "weeks")
  }
  if (Math.abs(weeks) >= 4) {
    dateText = rtf.format(Math.round(months), "months")
  }
  return dateText
}
