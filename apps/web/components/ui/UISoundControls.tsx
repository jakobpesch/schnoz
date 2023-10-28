import { Box, IconButton } from "@chakra-ui/react"
import { Volume2Icon, VolumeIcon } from "lucide-react"
import { useSound } from "../../providers/SoundProvider"

export const UISoundControls = () => {
  const { isMuted, setIsMuted } = useSound()

  return (
    <IconButton aria-label="volume-icon" onClick={() => setIsMuted(!isMuted)}>
      {isMuted ? <VolumeIcon /> : <Volume2Icon />}
    </IconButton>
  )
}
