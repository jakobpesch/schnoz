import { Heading, Stack } from "@chakra-ui/react"
import { NextPage } from "next"

const DonationPage: NextPage = () => {
  return (
    <Stack spacing="16" bg={"#f9f9f9"} height="100vh">
      <Heading textAlign="center" mt="16" color="gray.900">
        Thanks for considering to donate!
      </Heading>

      <iframe
        id="kofiframe"
        src="https://ko-fi.com/schnoz/?hidefeed=true&widget=true&embed=true&preview=true"
        style={{
          border: "none",
          width: "100%",
          padding: "4px",
          background: "#f9f9f9",
        }}
        height="712"
        title="schnoz"
      ></iframe>
    </Stack>
  )
}

export default DonationPage
