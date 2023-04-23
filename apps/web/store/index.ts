import { action, Action, createStore, createTypedHooks } from "easy-peasy"

export interface StoreModel {
  isConnected: boolean
  setIsConnected: Action<StoreModel, boolean>
}

const initialState: StoreModel = {
  isConnected: false,
  setIsConnected: action((state, isConnected) => {
    state.isConnected = isConnected
  }),
}

const { useStoreActions, useStoreDispatch, useStoreState } =
  createTypedHooks<StoreModel>()

// We export the hooks from our store as they will contain the
// type information on them
export { useStoreActions, useStoreDispatch, useStoreState }

export const store = createStore(initialState)
