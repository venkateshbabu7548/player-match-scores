const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
// API 1
app.get("/players/", async (request, response) => {
  const playerQuery = `SELECT player_id AS playerId, player_name AS playerName FROM player_details;`;
  const playersList = await db.all(playerQuery);
  response.send(playersList);
});

// API 2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `SELECT player_id AS playerId, player_name AS playerName FROM player_details WHERE player_id = ${playerId};`;
  const player = await db.get(playerQuery);
  response.send(player);
});

// API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayer = `UPDATE player_details SET player_name = "${playerName}";`;
  await db.run(updatePlayer);
  response.send("Player Details Updated");
});

// API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `SELECT match_id AS matchId, match, year FROM match_details WHERE match_id = ${matchId};`;
  const match = await db.get(getMatchQuery);
  response.send(match);
});

// API 5
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `SELECT match_details.match_id AS matchId, match_details.match, match_details.year FROM match_details NATURAL JOIN player_match_score WHERE player_id = ${playerId};`;
  const playerMatch = await db.all(getPlayerMatchesQuery);
  response.send(playerMatch);
});

// API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchesPlayerDetails = `SELECT player_details.player_id AS playerId, player_details.player_name AS playerName FROM player_details NATURAL JOIN player_match_score WHERE match_id = ${matchId};`;
  const matchPlayer = await db.all(getMatchesPlayerDetails);
  response.send(matchPlayer);
});

// API 7
app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getScores = `SELECT player_id AS playerId,player_name AS playerName, SUM(score) AS totalScore, SUM(fours) AS totalFours, SUM(sixes) AS totalSixes FROM player_details NATURAL JOIN player_match_score WHERE player_id = ${playerId};`;
  const result = await db.get(getScores);
  response.send(result);
});

module.exports = app;
