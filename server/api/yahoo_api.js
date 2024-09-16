const knex = require('knex')(require('../knexfile.js'));

const qs = require("qs");
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");

/**/
const AUTH_HEADER = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`, `binary`).toString(`base64`);

const axios = require("axios");

function getInitialAuthorization () {
    return axios({
        url: `https://api.login.yahoo.com/oauth2/get_token`,
        method: 'post',
        headers: {
            'Authorization': `Basic ${AUTH_HEADER}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify({
            grant_type: 'authorization_code',
            client_id: CONSUMER_KEY,
            client_secret: CONSUMER_SECRET,
            redirect_uri: 'oob',
            code: YAHOO_AUTH_CODE
        }),
        }).catch((err) => {
            console.error(err);
        });
}

function refreshAuthorizationToken (token) {
    return axios({
        url: `https://api.login.yahoo.com/oauth2/get_token`,
        method: 'post',
        headers: {
            'Authorization': `Basic ${AUTH_HEADER}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36',
        },
        data: qs.stringify({
            redirect_uri: 'oob',
            grant_type: 'refresh_token',
            refresh_token: token
        }),
        timeout: 10000,
    }).catch((err) => {
        console.error(`Error in refreshAuthorizationToken(): ${err}`);
    });       
}

async function makeAPIrequest(accessToken, refreshToken, url) {
    let response;
    try {
        response = await axios({
        url: url,
            method: 'get',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        const jsonData = response.data;
        return jsonData;
    } catch (err) {
        if (err.response.data && err.response.data.error && err.response.data.error.description && err.response.data.error.description.includes("token_expired")) {
            const newToken = await refreshAuthorizationToken(refreshToken);
            if (newToken && newToken.data && newToken.data.access_token) {
                let CREDENTIALS = newToken.data;
                // Just a wrapper for fs.writeFile
                writeToFile(JSON.stringify(newToken.data), AUTH_FILE, 'w');
                return makeAPIrequest(url, newToken.data.access_token, newToken.data.refresh_token);

             }
        } else {
            console.error(err)
            process.exit();
        }
    }
}

function setPlayerPositions(playerPositions){
    let positionsNotToDb = ["NA", "IL", "CI", "MI"]
    let playerPositionsToDb = [];
    for(let i = 0; i < playerPositions.length; i++){
        if(!positionsNotToDb.includes(playerPositions[i])){
            playerPositionsToDb.push(playerPositions[i])
        }
    }

    if(playerPositionsToDb.includes("SP") && playerPositionsToDb.includes("RP")){
        return "SP,RP";
    } else if (playerPositionsToDb.includes("SP") && !playerPositionsToDb.includes("RP")){
        return "SP";
    } else if (playerPositionsToDb.includes("RP") && !playerPositionsToDb.includes("SP")){
        return "RP";
    } else if (!playerPositionsToDb.includes("RP") && !playerPositionsToDb.includes("SP") && playerPositionsToDb.includes("P")){
        return "P";
    } else if (playerPositionsToDb.length == 1 && playerPositionsToDb.includes("Util")){
        return "Util";
    } else {
        playerPositionsToDb.splice(playerPositionsToDb.indexOf("Util"),1)
        return playerPositionsToDb.join(",")
    }
}

function loadPlayersToDb(){
    getInitialAuthorization().then((res) => {
        const access_token = res.data.access_token
        const refresh_token = res.data.refresh_token
    
        let totalPlayers = 2225;
        // let totalPlayers = 100;
        let start = 1;
    
        while(start < totalPlayers){
            makeAPIrequest(access_token, refresh_token, `https://fantasysports.yahooapis.com/fantasy/v2/league/431.l.21149/players;start=${start}`).then((data) => {
                const parser = new XMLParser();
                let jObj = parser.parse(data);
                const players = jObj.fantasy_content.league.players.player
                players.forEach((player) => {                    
                    const playerPositions = player.eligible_positions.position;
                    knex('players')
                    .insert({
                        name: player.name.full,
                        position: setPlayerPositions(playerPositions),
                        team: player.editorial_team_full_name,
                        yahoo_url: player.url
                    })
                    .then(res => {
                        console.log(res)
                    })
                    .catch(err => {
                    console.log('Error creating a user', err);
                    });
                })
            });
            start += 25;
        }
    })
}
// loadPlayersToDb();

function loadTeamsPlayersToDb(){
    getInitialAuthorization().then((res) => {
        const access_token = res.data.access_token
        const refresh_token = res.data.refresh_token
    
        let totalTeams = 14;
        let start = 1
        while(start <= totalTeams){
            makeAPIrequest(access_token, refresh_token, `https://fantasysports.yahooapis.com/fantasy/v2/team/431.l.21149.t.${start}/roster`).then((data) => {
                const parser = new XMLParser();
                let jObj = parser.parse(data);
                let teamName = jObj.fantasy_content.team.name;
                if(teamName.includes("Big Wood")){
                    teamName = "Big Wood Bison"
                } else if (teamName.includes("Loss of")){
                    teamName = "Loss of Foresight"
                }
                const roster = jObj.fantasy_content.team.roster.players.player;
                roster.forEach((player) => {
                    const playerPositions = player.eligible_positions.position;
                    knex('teams_players')
                    .insert({
                      name: player.name.full,
                      position: setPlayerPositions(playerPositions),
                      team: teamName,
                      player_team: player.editorial_team_full_name,
                      yahoo_url: player.url
                    })
                    .then(res => {
                        console.log(res)
                    })
                    .catch(err => {
                      console.log('Error creating a user', err);
                    });
                })
            });
            start++;
        }
    })
}
loadTeamsPlayersToDb();

// makeAPIrequest("https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=mlb/teams")

// makeAPIrequest("https://fantasysports.yahooapis.com/fantasy/v2/league/431.l.21149/teams")
// makeAPIrequest("https://fantasysports.yahooapis.com/fantasy/v2/league/431.l.21149/players;start=1,count=25")