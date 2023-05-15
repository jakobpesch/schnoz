export const validateEmail = (value: string) => {
  let error: string | undefined = undefined
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
    error = "Invalid email address"
  }
  return error
}

export const validateName = (value: string) => {
  let error: string | undefined = undefined
  if (value.length < 3) {
    error = "Name must be at least 3 characters long"
  }
  return error
}

export const validatePassword = (value: string) => {
  let error: string | undefined = undefined
  if (value.length < 6) {
    error = "Password must be at least 6 characters long"
  }
  return error
}
