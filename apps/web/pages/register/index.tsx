import {
  Button,
  FormControl,
  FormErrorMessage,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import { Field, Formik } from "formik"
import Link from "next/link"
import {
  validateEmail,
  validateName,
  validatePassword,
} from "../../components/form/form-validators"
import useAuth from "../../hooks/useAuth"

interface RegisterFormPayload {
  email: string
  password: string
  name: string
}
const initialValues: RegisterFormPayload = {
  email: "",
  password: "",
  name: "",
}

export default function RegisterPage() {
  const { register } = useAuth()
  return (
    <Stack width="full" height="100vh" justify="center" align="center">
      <Heading>Register</Heading>
      <Formik
        initialValues={initialValues}
        // validate={validate}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          const { email, password, name } = values
          register({ email, password, name }).finally(() =>
            setSubmitting(false),
          )
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
            <Stack width="300" maxWidth="300">
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
                isInvalid={(!values.name || !!errors.name) && touched.name}
              >
                <Field
                  as={Input}
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Username"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.name}
                  validate={validateName}
                />
                {errors.name && (
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
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
                  validate={validatePassword}
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
            </Stack>
          </form>
        )}
      </Formik>
      <Text fontSize="sm" color="gray" fontStyle="italic">
        Already got an account?{" "}
        <Button
          fontSize="inherit"
          colorScheme="gray"
          variant="link"
          fontStyle="inherit"
        >
          <Link href="/login">Sign in</Link>
        </Button>
      </Text>
    </Stack>
  )
}
