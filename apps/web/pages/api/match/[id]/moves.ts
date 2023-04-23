import { MatchStatus, Prisma, Tile, UnitType } from "database"
import assert from "assert"
import type { NextApiRequest, NextApiResponse } from "next"
import { createCustomGame } from "../../../../gameLogic/GameVariants"
import { IUnitConstellation } from "../../../../models/UnitConstellation.model"
import { prisma } from "../../../../prisma/client"
import {
  checkConditionsForUnitConstellationPlacement,
  Special,
  SPECIAL_TYPES,
} from "../../../../services/GameManagerService"
import { MatchRich, matchRichInclude } from "../../../../types/Match"
import {
  buildTileLookupId,
  getNewlyRevealedTiles,
  getTileLookup,
} from "../../../../utils/coordinateUtils"

const getLeadingPlayer = (match: MatchRich) => {
  const isSameScore = match.players.every(
    (player) => player.score === match.players[0].score
  )

  if (isSameScore) {
    return null
  }
  return (
    [...match.players]
      .sort((p1, p2) => {
        if (p1.score > p2.score) {
          return -1
        } else {
          return 1
        }
      })
      .shift() ?? null
  )
}

const maxScore = 5

const isLastTurn = (match: MatchRich) =>
  match.turn >= (match.gameSettings?.maxTurns ?? 0)

const determineWinner = (match: MatchRich) => {
  const leadingPlayer = getLeadingPlayer(match)
  if (!leadingPlayer) {
    return null
  }
  if (leadingPlayer.score >= maxScore) {
    return leadingPlayer
  }
  if (!isLastTurn(match)) {
    return null
  }
  return leadingPlayer
}

function isSpecial(value: unknown): value is Special {
  const special = value as Special
  return (
    typeof special.cost === "number" && SPECIAL_TYPES.includes(special.type)
  )
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MatchRich>
) {
  const { body, method, query } = req
  let match: MatchRich | null
  const {
    participantId,
    row: targetRow,
    col: targetCol,
    ignoredRules,
    specials,
  } = body
  const { id: matchId } = query

  if (
    !participantId ||
    typeof targetRow !== "number" ||
    typeof targetCol !== "number"
  ) {
    res.status(400).end("Query is not complete")
    return
  }

  if (!(Array.isArray(specials) && specials.every(isSpecial))) {
    res.status(404).end("Invalid query param value for specials.")
    return
  }

  if (!Array.isArray(ignoredRules)) {
    res
      .status(400)
      .end("ignoredRules must be an Array. Received: " + ignoredRules)
    return
  }

  if (typeof matchId !== "string") {
    res.status(404).end(`Invalid match id provided: ${matchId}.`)
    return
  }

  switch (method) {
    case "POST":
      // Create a new move
      match = await prisma.match.findUnique({
        where: { id: matchId },
        include: matchRichInclude,
      })

      if (match === null) {
        res.status(500).end("Could not find match")
        break
      }

      if (!match.map) {
        res.status(500).end("Map is missing")
        break
      }

      const unitConstellation: IUnitConstellation = body.unitConstellation

      assert(match.activePlayer)
      const currentBonusPoints =
        match.activePlayer.bonusPoints + unitConstellation.value

      const canAffordSpecials =
        currentBonusPoints >=
        specials.reduce((totalCost, special) => {
          return totalCost + special.cost
        }, 0)

      if (!canAffordSpecials) {
        res.status(500).end("Not enough bonus points for specials")
        break
      }

      const tileLookup = getTileLookup(match.map.tiles)
      const { translatedCoordinates, error } = {
        translatedCoordinates: [],
        error: { message: "TODO", statusCode: 1337 },
      }
      // checkConditionsForUnitConstellationPlacement(
      //   [targetRow, targetCol],
      //   unitConstellation,
      //   match,
      //   match.map,
      //   tileLookup,
      //   ignoredRules,
      //   participantId,
      //   specials
      // )

      if (error) {
        res.status(error.statusCode).end(error.message)
        break
      }

      const { tiles: revealedTiles, error: revealedError } =
        getNewlyRevealedTiles(tileLookup, translatedCoordinates)

      if (revealedError) {
        res.status(revealedError.statusCode).end(revealedError.message)
        break
      }

      const updateTilesPromises: Prisma.Prisma__TileClient<Tile, never>[] = []
      translatedCoordinates.forEach((coordinate) => {
        const { mapId, row, col } = tileLookup[buildTileLookupId(coordinate)]
        updateTilesPromises.push(
          prisma.tile.update({
            where: {
              mapId_row_col: {
                mapId,
                row,
                col,
              },
            },
            data: {
              unit: {
                create: {
                  type: UnitType.UNIT,
                  ownerId: participantId,
                },
              },
            },
          })
        )
      })
      revealedTiles.forEach(({ mapId, row, col }) => {
        updateTilesPromises.push(
          prisma.tile.update({
            where: {
              mapId_row_col: { mapId, row, col },
            },
            data: {
              visible: true,
            },
          })
        )
      })
      await Promise.all(updateTilesPromises)
      const matchWithPlacedTiles = await prisma.match.findUnique({
        where: { id: matchId },
        include: matchRichInclude,
      })

      if (
        !matchWithPlacedTiles ||
        !matchWithPlacedTiles.activePlayer ||
        !matchWithPlacedTiles.map
      ) {
        res.status(500).end("Match could not be fetched")
        break
      }

      if (!match.activePlayer) {
        res.status(500).end("Error while placing")
        break
      }
      const gameType = createCustomGame(match.gameSettings?.rules ?? null)
      const playersWithUpdatedScore = gameType.evaluate(matchWithPlacedTiles)

      for (let i = 0; i < playersWithUpdatedScore.length; i++) {
        const player = playersWithUpdatedScore[i]

        const bonusPointsFromCard =
          player.id === match.activePlayerId ? unitConstellation.value : 0

        const usedPointsFromSpecials =
          player.id === match.activePlayerId
            ? specials.reduce((totalCost, special) => {
                return totalCost + special.cost
              }, 0)
            : 0

        await prisma.participant.update({
          where: { id: player.id },
          data: {
            score: player.score,
            bonusPoints:
              match.activePlayer.bonusPoints +
              bonusPointsFromCard -
              usedPointsFromSpecials,
          },
        })
      }

      const matchWithUpdatedScore = {
        ...match,
        players: playersWithUpdatedScore,
      }

      const winnerId = determineWinner(matchWithUpdatedScore)?.id ?? null

      const shouldChangeActivePlayer = gameType.shouldChangeActivePlayer(
        match.turn
      )

      const shouldChangeCards = gameType.shouldChangeCards(match.turn)

      const openCards = shouldChangeCards
        ? gameType.changedCards()
        : matchWithPlacedTiles.openCards

      const nextActivePlayerId = shouldChangeActivePlayer
        ? matchWithPlacedTiles.players.find(
            (player) => player.id !== matchWithPlacedTiles.activePlayerId
          )?.id
        : matchWithPlacedTiles.activePlayerId

      if (!nextActivePlayerId) {
        res.status(500).end("Error while changing turns")
        break
      }

      const updatedMatch = await prisma.match.update({
        where: { id: match.id },
        data: {
          openCards,
          activePlayerId: nextActivePlayerId,
          turn: { increment: 1 },
          ...(isLastTurn(match) || winnerId
            ? { winnerId, status: MatchStatus.FINISHED, finishedAt: new Date() }
            : {}),
        },
        include: matchRichInclude,
      })

      res.status(201).json(updatedMatch)
      break
    default:
      res.setHeader("Allow", ["POST"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
