import pop from "../assets/sfx/pop.mp3"
import music from "../assets/sfx/music.mp3"
import music2 from "../assets/sfx/music2.mp3"

// type Sound = keyof typeof SoundService.SFX

const SFX = { pop } as const
const MUSIC = { music, music2 } as const

type SoundService = {
  SFX: typeof SFX
  MUSIC: typeof MUSIC
  muted: boolean
  volume: {
    music: number
    sfx: number
  }
  currentlyPlaying: {
    music: Partial<Record<keyof typeof MUSIC, HTMLAudioElement>>
    sfx: Partial<Record<keyof typeof SFX, HTMLAudioElement>>
  }
  playMusic: (music: keyof typeof MUSIC) => void
  playSound: (sfx: keyof typeof SFX) => void
}

export const SoundService: SoundService = {
  SFX,
  MUSIC,
  muted: true,
  volume: {
    music: 0.3,
    sfx: 1,
  },
  currentlyPlaying: {
    music: {},
    sfx: {},
  },
  playMusic(music: keyof typeof this.MUSIC) {
    console.log("before", this.currentlyPlaying)
    const audio =
      this.currentlyPlaying.music[music] ?? new Audio(this.MUSIC[music])

    if (!audio.paused) {
      return
    }

    audio.volume = this.volume.music
    this.currentlyPlaying.music[music] = audio
    audio.play()

    audio.onended = () => {
      delete this.currentlyPlaying.music[music]
    }
  },
  playSound(sfx: keyof typeof this.SFX) {
    const audio = new Audio(this.SFX[sfx])
    audio.volume = this.volume.sfx
    audio.play()
  },
}
