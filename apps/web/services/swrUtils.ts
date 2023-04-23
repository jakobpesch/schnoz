// @ts-ignore
export const fetcher = (...args) =>
  // @ts-ignore
  fetch(...args).then(async (res) => {
    if (!res.ok) {
      const errorMessage = await res.text()
      throw new Error(errorMessage, {
        cause: { status: res.status },
      })
    }
    return res.json()
  })
