import mongoose from "mongoose"
export interface Score {
  playerId: string
  score: number
}

export interface ScoreLookup {
  [playerId: string]: number
}
export const scoreSchema = new mongoose.Schema({
  playerId: String,
  score: Number,
})
export default mongoose.models["Score"] || mongoose.model("Score", scoreSchema)
