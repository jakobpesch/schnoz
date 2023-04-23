import mongoose, { Document } from "mongoose"
import { mapSchema, IMap } from "./Map.model"
import { IMove } from "./Move.model"
import { Score, scoreSchema } from "./Score.model"

export type MatchStatus = "created" | "started" | "finished"
export interface IMatch {
  createdBy: string
  createdAt: Date
  updatedAt: Date
  startedAt: Date
  finishedAt: Date
  activePlayer: string
  players: string[]
  status: MatchStatus
  map: IMap
  moves: IMove[]
  turn: number
  maxTurns: number
  winner?: string
  scores: Score[]
}

export interface IMatchDoc extends IMatch, Document {}

const matchSchema = new mongoose.Schema(
  {
    createdBy: String,
    status: String,
    startedAt: Date,
    finishedAt: Date,
    players: {
      type: Array,
      items: String,
    },
    map: mapSchema,
    activePlayer: String,
    turn: Number,
    maxTurns: Number,
    winner: String,
    scores: {
      type: Array,
      items: scoreSchema,
    },
  },
  { timestamps: true }
)

export default mongoose.models["Match"] || mongoose.model("Match", matchSchema)
