import { ReactNode, createContext, useContext, useEffect, useRef } from "react"
import music from "../assets/sfx/music.mp3"
import music2 from "../assets/sfx/music2.mp3"
import pop from "../assets/sfx/pop.mp3"
import coin from "../assets/sfx/coin.mp3"
import {
  setIsMuted,
  setVolumeMaster,
  setVolumeMusic,
  setVolumeSFX,
  useSettingsStore,
} from "../store"

export const SFX = { pop, coin } as const
export const MUSIC = { music, music2 } as const

// Define the shape of the SoundContext
interface SoundContextType {
  isMuted: boolean
  volumeMaster: number
  volumeSFX: number
  volumeMusic: number
  setIsMuted: (mute: boolean) => void
  setVolumeMaster: (volume: number) => void
  setVolumeSFX: (volume: number) => void
  setVolumeMusic: (volume: number) => void
  playSFX: (sfx: keyof typeof SFX) => void
  playMusic: (music: keyof typeof MUSIC) => void
  stopMusic: () => void
}

// Create the SoundContext
const SoundContext = createContext<SoundContextType | undefined>(undefined)

// Custom hook to use the SoundContext
export function useSound() {
  const context = useContext(SoundContext)
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider")
  }
  return context
}

// SoundProvider component to manage sound settings
interface SoundProviderProps {
  children: ReactNode
}

export function SoundProvider({ children }: SoundProviderProps) {
  const isMuted = useSettingsStore((state) => state.isMuted)
  const volumeMaster = useSettingsStore((state) => state.volumeMaster)
  const volumeSFX = useSettingsStore((state) => state.volumeSFX)
  const volumeMusic = useSettingsStore((state) => state.volumeMusic)

  const currentlyPlaying = useRef<{
    music: Partial<Record<keyof typeof MUSIC, HTMLAudioElement>>
    sfx: Partial<Record<keyof typeof SFX, HTMLAudioElement>>
  }>({
    music: {},
    sfx: {},
  })

  useEffect(() => {
    return () => {
      Object.values(currentlyPlaying.current.music).forEach((audio) => {
        audio.remove()
      })
      Object.values(currentlyPlaying.current.sfx).forEach((audio) => {
        audio.remove()
      })
    }
  })

  useEffect(() => {
    if (isMuted) {
      Object.values(currentlyPlaying.current.music).forEach(
        (audio) => (audio.muted = true),
      )
      Object.values(currentlyPlaying.current.sfx).forEach(
        (audio) => (audio.muted = true),
      )
    } else {
      Object.values(currentlyPlaying.current.music).forEach(
        (audio) => (audio.muted = false),
      )
      Object.values(currentlyPlaying.current.sfx).forEach(
        (audio) => (audio.muted = false),
      )
    }
  }, [isMuted])

  useEffect(() => {
    if (isMuted) {
      return
    }

    Object.values(currentlyPlaying.current.music).forEach(
      (audio) => (audio.volume = volumeMaster * volumeMusic),
    )
    Object.values(currentlyPlaying.current.sfx).forEach(
      (audio) => (audio.volume = volumeMaster * volumeSFX),
    )
  }, [volumeMaster])

  useEffect(() => {
    if (isMuted) {
      return
    }
    Object.values(currentlyPlaying.current.music).forEach(
      (audio) => (audio.volume = volumeMaster * volumeMusic),
    )
  }, [volumeMusic])

  useEffect(() => {
    if (isMuted) {
      return
    }
    Object.values(currentlyPlaying.current.sfx).forEach(
      (audio) => (audio.volume = volumeMaster * volumeSFX),
    )
  }, [volumeSFX])

  const playSFX = (sfx: keyof typeof SFX) => {
    const audio = new Audio(SFX[sfx])
    audio.volume = volumeMaster * volumeSFX
    audio.muted = isMuted
    audio.play()
    audio.onended = () => audio.remove()
  }

  const playMusic = (music: keyof typeof MUSIC) => {
    const audio =
      currentlyPlaying.current.music[music] ?? new Audio(MUSIC[music])

    if (!audio.paused) {
      // music is already playing
      return
    }

    audio.volume = isMuted ? 0 : volumeMaster * volumeMusic
    currentlyPlaying.current.music[music] = audio

    audio.loop = true
    audio.play()

    // audio.onended = () => {
    //   delete currentlyPlaying.current.music[music]
    // }
  }

  const stopMusic = () => {
    Object.values(currentlyPlaying.current.music).forEach((audio) => {
      audio.pause()
    })
    currentlyPlaying.current.music = {}
  }

  const value: SoundContextType = {
    isMuted,
    volumeMaster,
    volumeSFX,
    volumeMusic,
    setIsMuted,
    setVolumeMaster,
    setVolumeSFX,
    setVolumeMusic,
    playSFX,
    playMusic,
    stopMusic,
  }

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}
