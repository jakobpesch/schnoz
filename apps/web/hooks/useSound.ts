// import { Box, IconButton } from "@chakra-ui/react"
// import { Volume2Icon, VolumeIcon } from "lucide-react"
// import { useState } from "react"
// import { SoundService } from "../../services/SoundService"

// type SoundService = {
//   SFX: typeof SFX
//   MUSIC: typeof MUSIC
//   muted: boolean
//   volume: {
//     music: number
//     sfx: number
//   }
//   currentlyPlaying: {
//     music: Partial<Record<keyof typeof MUSIC, HTMLAudioElement>>
//     sfx: Partial<Record<keyof typeof SFX, HTMLAudioElement>>
//   }
//   playMusic: (music: keyof typeof MUSIC) => void
//   playSound: (sfx: keyof typeof SFX) => void
// }

// export const useSound = () => {
//   const [muted, setMuted] = useState(false)
//   const [volumeMaster, setVolumeMaster] = useState(1)
//   const [volumeMusic, setVolumeMusic] = useState(0.2)
//   const [volumeSFX, setVolumeSFX] = useState(0.4)

//   playMusic(music: keyof typeof this.MUSIC) {
//     console.log("before", this.currentlyPlaying)
//     const audio =
//       this.currentlyPlaying.music[music] ?? new Audio(this.MUSIC[music])

//     if (!audio.paused) {
//       return
//     }

//     audio.volume = this.volume.music
//     this.currentlyPlaying.music[music] = audio
//     audio.play()

//     audio.onended = () => {
//       delete this.currentlyPlaying.music[music]
//     }
//   },
//   playSound(sfx: keyof typeof this.SFX) {
//     const audio = new Audio(this.SFX[sfx])
//     audio.volume = this.volume.sfx
//     audio.play()
//   },
//   return { muted, setMuted }
// }

// // type Sound = keyof typeof SoundService.SFX

// export const SoundService: SoundService = {
//   SFX,
//   MUSIC,
//   muted: true,
//   volume: {
//     music: 0.3,
//     sfx: 1,
//   },
//   currentlyPlaying: {
//     music: {},
//     sfx: {},
//   },

// }
