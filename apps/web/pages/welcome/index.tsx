import { Button, Container, HStack, Heading, Stack } from "@chakra-ui/react"
import { NextPage } from "next"
import Link from "next/link"
import { useRouter } from "next/router"
import useAuth from "../../hooks/useAuth"

const Welcome: NextPage = () => {
  const router = useRouter()
  const { profile, playAsGuest } = useAuth()

  if (profile) {
    router.replace("/")
  }

  return (
    <Container height="100vh" centerContent placeContent="center">
      <Heading fontFamily="Dokdo" fontSize="90px" color="teal.300">
        schnoz
      </Heading>
      <Stack>
        <HStack>
          <Button onClick={playAsGuest}>Play as guest</Button>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </HStack>
        <Link href="/register">
          <Button width="full" colorScheme="blue">
            Sign up
          </Button>
        </Link>
      </Stack>
    </Container>
  )
}

export default Welcome
