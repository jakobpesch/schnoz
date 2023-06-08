import { ApiResponse } from "types"
import { eraseCookie, getCookie } from "./CookieService"

type HTTPMethods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

type FetchParams = {
  url: string
  method?: HTTPMethods
  headers?: HeadersInit
  body?: string | Record<string, unknown>
}

export const fetchApi = async <T>(params: FetchParams) => {
  const options: {
    method: HTTPMethods
    headers?: HeadersInit
    body?: string
  } = { method: params.method ?? "GET" }

  let headers: HeadersInit = {
    "Content-Type": "application/json",
  }
  const jwt = getCookie("jwt")
  if (jwt) {
    headers.Authorization = `Bearer ${jwt}`
  }

  if (params.headers) {
    headers = params.headers
  }

  options.headers = headers

  if (params.body) {
    let parsedBody = params.body
    if (typeof parsedBody !== "string") {
      parsedBody = JSON.stringify(parsedBody)
    }
    options.body = parsedBody
  }

  const response = await fetch(params.url, options)

  if (response.status === 401) {
    // jwt is invalid
    eraseCookie("jwt")
    window.location.assign("/welcome")
  }

  const object = await response.json()

  return object as ApiResponse<T>
}
