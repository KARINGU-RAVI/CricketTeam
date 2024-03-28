const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'cricketTeam.db')
const app = express()
app.use(express.json())
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

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

// Get palyers API
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
  SELECT
   * 
   FROM
    cricket_team;`
  const playerarrayy = await db.all(getPlayersQuery)
  response.send(
    playerarrayy.map(player => {
      convertDbObjectToResponseObject(player)
    }),
  )
})

//Get player API
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getBookQuery = `
    SELECT
        *
    FROM
        cricket_team
    WHERE
         player_id = ${playerId};`

  let palyer = await db.get(getBookQuery)
  response.send(convertDbObjectToResponseObject(palyer))
})

//Get post API
app.post('/players/', async (request, res) => {
  // const bookDetails = request.body
  const {playerName, jerseyNumber, role} = request.body
  const addplayerQuery = `
    INSERT INTO
     cricket_team (player_name,jersey_number,role)
    VALUES
      ('${playerName}',${jerseyNumber},'${role}');`
  let playeradded = await db.run(addplayerQuery)
  //   let bookId = bookadded.lastID
  res.send('Player Added to Team')
})

//Get player put API
app.put('/players/:playerId', async (req, res) => {
  let {playerId} = req.params

  // const playerDetails = req.body
  const {playerName, jerseyNumber, role} = req.body

  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
      player_name='${playerName}',
      jersey_number=${jerseyNumber},
      role='${role}'
      WHERE  player_id = ${playerId};`
  await db.run(updatePlayerQuery)
  res.send('Player Details Updated')
})
//Get player delete API
app.delete('/players/:playerId', async (req, res) => {
  let {playerId} = req.params
  const deleteplayerQuery = `
    DELETE FROM
        cricket_team
    WHERE
        player_id = ${playerId};`
  await db.run(deleteplayerQuery)
  res.send('Player Removed')
})

// // app.get('/authors/:authorId/books/', async (req, res) => {
// //   let {authorId} = req.params
// //   const getAuthorBooksQuery = `
// //     SELECT
// //     *
// //     FROM
// //         book
// //     WHERE
// //         author_id = ${authorId};`
// //   let dbres = await db.all(getAuthorBooksQuery)
// //   res.send(dbres)
// // })
module.exports = app
