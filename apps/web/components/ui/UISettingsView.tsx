import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
} from "@chakra-ui/react"
import { SFX, useSound } from "../../providers/SoundProvider"
import { useState } from "react"
import { SettingsIcon } from "@chakra-ui/icons"

export const UISettingsView = () => {
  const [isOpen, setIsOpen] = useState(false)
  const {
    isMuted,
    setIsMuted,
    volumeMaster,
    setVolumeMaster,
    volumeMusic,
    setVolumeMusic,
    volumeSFX,
    setVolumeSFX,
  } = useSound()
  const playPop = (volume: number) => {
    const audio = new Audio(SFX.pop)
    audio.volume = volume
    audio.play()
    audio.onended = () => {
      console.log("removing audio element")

      audio.remove()
    }
  }
  return (
    <>
      <IconButton onClick={() => setIsOpen(true)} aria-label="settings">
        <SettingsIcon />
      </IconButton>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isCentered
        closeOnOverlayClick
        closeOnEsc
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing="4">
              <Text
                fontSize="x-small"
                fontWeight="bold"
                color="gray.400"
                textTransform="uppercase"
              >
                Volume
              </Text>
              <Stack spacing="2">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.300">
                    Master
                  </Text>
                  <Slider
                    value={volumeMaster}
                    min={0}
                    step={0.05}
                    max={1}
                    onChange={(volume) => {
                      setVolumeMaster(volume)
                      playPop(volume)
                    }}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.300">
                    Music
                  </Text>
                  <Slider
                    value={volumeMusic}
                    min={0}
                    step={0.05}
                    max={1}
                    onChange={(volume) => {
                      setVolumeMusic(volume)
                      playPop(volume)
                    }}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.300">
                    SFX
                  </Text>
                  <Slider
                    value={volumeSFX}
                    min={0}
                    step={0.05}
                    max={1}
                    onChange={(volume) => {
                      setVolumeSFX(volume)
                      playPop(volume)
                    }}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Box>
                <Checkbox
                  isChecked={isMuted}
                  onChange={(e) => {
                    setIsMuted(e.target.checked)
                    playPop(volumeSFX)
                  }}
                >
                  Mute
                </Checkbox>
              </Stack>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsOpen(false)}>Done</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
