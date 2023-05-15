import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import { Field, Formik } from "formik"
import { FC } from "react"
import { setCookie } from "../../services/CookieService"
import { loginUser, registerUser } from "../../services/GameManagerService"
import Link from "next/link"
import { validateEmail } from "../../components/form/form-validators"
import { useRouter } from "next/router"

interface LoginFormPayload {
  email: string
  password: string
}
const initialValues: LoginFormPayload = {
  email: "",
  password: "",
}

export default function LoginPage() {
  const router = useRouter()
  return (
    <Stack width="full" height="100vh" justify="center" align="center">
      <Heading>Sign in</Heading>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          const { email, password } = values
          try {
            await loginUser({
              email,
              password,
            })
            router.push("/")
          } catch (error) {
            setStatus("Incorrect combination of credentials.")
          } finally {
            setStatus()
            setSubmitting(false)
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          status,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          /* and other goodies */
        }) => (
          <form onSubmit={handleSubmit}>
            <Stack maxWidth="300">
              <FormControl
                isInvalid={(!values.email || !!errors.email) && touched.email}
              >
                <Field
                  as={Input}
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  validate={validateEmail}
                />
                {errors.email && (
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl
                isInvalid={
                  (!values.password || !!errors.password) && touched.password
                }
              >
                <Field
                  as={Input}
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                />
                {errors.password && (
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl>
                <Button
                  colorScheme="blue"
                  width="full"
                  type="submit"
                  disabled={isSubmitting}
                >
                  Submit
                </Button>
              </FormControl>
              <Text fontSize="sm" color="red.300">
                {status}
              </Text>
            </Stack>
          </form>
        )}
      </Formik>
      <Text fontSize="sm" color="gray" fontStyle="italic">
        No account?{" "}
        <Button
          fontSize="inherit"
          colorScheme="gray"
          variant="link"
          fontStyle="inherit"
        >
          <Link href="/register">Sign up</Link>
        </Button>
      </Text>
    </Stack>
  )
}
