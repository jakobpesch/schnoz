import { Flex, Text } from "@chakra-ui/react"
interface UILoggingViewProps {
  statusLog: string[]
}
export const UILoggingView = (props: UILoggingViewProps) => (
  <Flex
    position="fixed"
    bottom="1vw"
    right="1vw"
    direction="column-reverse"
    maxHeight="5vw"
    maxWidth="20vw"
    width="20vw"
    overflowY="scroll"
    p="0.5vw"
    m="0.5vw"
    borderRadius="0.5vw"
    borderWidth="0.08vw"
    borderColor="transparent"
    color="gray.500"
    _hover={{
      color: "white",
      bg: "gray.700",
      borderColor: "initial",
      maxHeight: "30vw",
    }}
    // css={{
    //   "-webkit-mask-image":
    //     "-webkit-gradient(linear, left bottom, left top, color-stop(0%, rgba(0,0,0,1)),color-stop(60%, rgba(0,0,0,1)), color-stop(90%, rgba(0,0,0,0)));",
    //   "&:hover": {
    //     "-webkit-mask-image": "none",
    //   },
    // }}
  >
    {props.statusLog.map((status, index) => (
      <Text key={index} fontSize="0.9vw">
        {status}
      </Text>
    ))}
  </Flex>
)
