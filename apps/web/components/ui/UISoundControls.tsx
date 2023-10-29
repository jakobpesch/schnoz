import { Box, IconButton } from "@chakra-ui/react"
import { Volume2Icon, VolumeIcon } from "lucide-react"
import { useSound } from "../../providers/SoundProvider"

export const UISoundControls = () => {
  const { isMuted, setIsMuted } = useSound()

  return (
    <IconButton
      backdropBlur="10px"
      backdropFilter="auto"
      aria-label="volume-icon"
      onClick={() => setIsMuted(!isMuted)}
    >
      {isMuted ? <VolumeIcon /> : <Volume2Icon />}
    </IconButton>
  )
}
