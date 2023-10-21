import {
  Flex,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/react"
import { ReactNode, useEffect, useState } from "react"
import { scaled } from "./ui/UIScoreView"

export const HoveredTooltip = (props: {
  trigger: ReactNode
  header?: ReactNode
  body?: ReactNode
  footer?: ReactNode
}) => {
  const [hovering, setHovering] = useState(false)
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (!hovering) {
      setIsOpen(false)
    } else {
      timer = setTimeout(() => {
        setIsOpen(true)
      }, 1000)
    }
    return () => {
      clearTimeout(timer)
    }
  }, [hovering])
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover
      isOpen={isOpen}
      placement="left-start"
      autoFocus={false}
      preventOverflow
    >
      <PopoverArrow />
      <PopoverTrigger>
        <Flex
          align="center"
          justify="center"
          padding={scaled(1)}
          rounded={scaled(8)}
          _hover={{
            bg: "gray.600",
          }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {props.trigger}
        </Flex>
      </PopoverTrigger>
      <PopoverContent maxWidth="min-content">
        {props.header && (
          <PopoverHeader fontWeight="bold">{props.header}</PopoverHeader>
        )}
        {props.body && (
          <PopoverBody width="min-content">{props.body}</PopoverBody>
        )}
        {props.footer && (
          <PopoverFooter
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            pb={4}
          >
            {props.footer}
          </PopoverFooter>
        )}
      </PopoverContent>
    </Popover>
  )
}
