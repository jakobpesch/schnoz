import { create } from "zustand"
import { persist } from "zustand/middleware"

type SettingsStoreState = {
  isMuted: boolean
  volumeMaster: number
  volumeMusic: number
  volumeSFX: number
}

type SettingsStore = SettingsStoreState

const initialSettingsStore: SettingsStore = {
  isMuted: false,
  volumeMaster: 1,
  volumeMusic: 1,
  volumeSFX: 1,
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...initialSettingsStore,
    }),
    { name: "schnoz-settings-storage" },
  ),
)

export const setIsMuted = (isMuted: boolean) => {
  useSettingsStore.setState((state) => ({ isMuted }))
}

export const setVolumeMaster = (volumeMaster: number) => {
  useSettingsStore.setState((state) => ({ volumeMaster }))
}

export const setVolumeMusic = (volumeMusic: number) => {
  useSettingsStore.setState((state) => ({ volumeMusic }))
}

export const setVolumeSFX = (volumeSFX: number) => {
  useSettingsStore.setState((state) => ({ volumeSFX }))
}
