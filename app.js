const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketMatchDetails.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()
app.get('/players/', async (request, response) => {
  const api1 = `
  SELECT 
  player_id AS playerId,
  player_name AS playerName
  FROM 
  player_details;`
  const a = await db.all(api1)
  response.send(a)
})
//GET ONLY ONE
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const api2 = `
  SELECT 
  player_id AS playerId,
  player_name AS playerName
  FROM 
  player_details
  WHERE 
  player_id = ${playerId};`
  const b = await db.get(api2)
  response.send(b)
})
//PUT
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerdetails = request.body
  const {playerName} = playerdetails
  const api3 = `
  UPDATE
  player_details
  SET 
  player_name = '${playerName}'
  WHERE 
  player_id = ${playerId};`
  await db.run(api3)
  response.send('Player Details Updated')
})
//
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const api4 = `
  SELECT 
  match_id AS matchId,
  match,
  year
  FROM 
  match_details
  WHERE 
  match_id = ${matchId};`
  const c = await db.get(api4)
  response.send(c)
})
//
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const api5 = `
  SELECT 
  match_id AS matchId,
  match,
  year
  FROM 
  player_match_score NATURAL JOIN match_details
  WHERE 
  player_id = ${playerId};`
  const d = await db.all(api5)
  response.send(d)
})
//api6
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const api6 = `
  SELECT 
  player_match_score.player_id AS playerId,
  player_name AS playerName
  FROM 
  player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id
  WHERE 
  match_id = ${matchId};`
  const x = await db.all(api6)
  response.send(x)
})
//api7
app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const api7 = `
  SELECT 
  player_details.player_id AS playerId,
  player_details.player_name AS playerName,
  SUM(player_match_score.score) AS totalScore,
  SUM(fours) AS totalFours,
  SUM(sixes) AS totalSixes
  FROM 
  player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id
  WHERE
  player_details.player_id =${playerId};`
  const z = await db.get(api7)
  response.send(z)
})
module.exports = app
