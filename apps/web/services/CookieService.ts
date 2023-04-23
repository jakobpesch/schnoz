export const setCookie = (name: any, value: any, days: any) => {
  let expires = ""
  if (days) {
    let date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = "; expires=" + date.toUTCString()
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/"
}
export const getCookie = (name: any) => {
  const nameWithEqualSign = name + "="
  const cookies = document.cookie.split(";")
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i]
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1, cookie.length)
    }
    if (cookie.indexOf(nameWithEqualSign) == 0)
      return cookie.substring(nameWithEqualSign.length, cookie.length)
  }
  return null
}
export const eraseCookie = (name: any) => {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
}
