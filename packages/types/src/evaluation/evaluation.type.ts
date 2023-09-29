import { Participant } from "database"
import { MatchRich } from "../match/match-rich.type"

export type Evaluation = (match: MatchRich) => Participant[]
