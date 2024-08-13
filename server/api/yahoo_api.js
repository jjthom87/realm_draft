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

// getInitialAuthorization().then((res) => {
//     console.log(res.data.access_token)
        //ACCESS_TOKEN = res.data.access_token
        //REFRESH_TOKEN = res.data.refresh_token

        //makeApiRequest should be called in here

// })

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

async function makeAPIrequest (url) {
    let response;
    try {
        response = await axios({
        url: url,
            method: 'get',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        const jsonData = response.data;
        return jsonData;
    } catch (err) {
        if (err.response.data && err.response.data.error && err.response.data.error.description && err.response.data.error.description.includes("token_expired")) {
            const newToken = await refreshAuthorizationToken(REFRESH_TOKEN);
            if (newToken && newToken.data && newToken.data.access_token) {
                let CREDENTIALS = newToken.data;
                // Just a wrapper for fs.writeFile
                writeToFile(JSON.stringify(newToken.data), AUTH_FILE, 'w');
                return makeAPIrequest(url, newToken.data.access_token, newToken.data.refresh_token);

             }
        } else {
            console.error(err)
            // console.error(`Error with credentials in makeAPIrequest()/refreshAuthorizationToken(): ${err}`);
            process.exit();
        }
    }
}

// makeAPIrequest("https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=mlb/teams")

// makeAPIrequest("https://fantasysports.yahooapis.com/fantasy/v2/league/431.l.21149/teams")
// makeAPIrequest("https://fantasysports.yahooapis.com/fantasy/v2/league/431.l.21149/players;start=1,count=25")

let totalPlayers = 2200;
let start = 1;

// while(start < totalPlayers){
//     makeAPIrequest(`https://fantasysports.yahooapis.com/fantasy/v2/league/431.l.21149/players;start=${start}`).then((data) => {
//         const parser = new XMLParser();
//         let jObj = parser.parse(data);
//         const players = jObj.fantasy_content.league.players.player
//         players.forEach((player) => {
//             knex('players')
//             .insert({
//               name: player.name.full,
//               position: player.primary_position
//             })
//             .then(res => {
//               // Pass the user object to serialize function
//             //   done(null, { id: userId[0] });
//                 console.log(res)
//             })
//             .catch(err => {
//               console.log('Error creating a user', err);
//             });
//         })
//     });
//     start += 25;
// }

// let totalTeams = 14;
// while(start < totalTeams){
    // makeAPIrequest(`https://fantasysports.yahooapis.com/fantasy/v2/team/431.l.21149.t.14/roster`).then((data) => {
    //     const parser = new XMLParser();
    //     let jObj = parser.parse(data);
    //     let teamName = jObj.fantasy_content.team.name;
    //     if(teamName.includes("Big Wood")){
    //         teamName = "Big Wood Bison"
    //     } else if (teamName.includes("Loss of")){
    //         teamName = "Loss of Foresight"
    //     }
    //     const roster = jObj.fantasy_content.team.roster.players.player;
    //     roster.forEach((player) => {
            // knex('teams_players')
            // .insert({
            //   name: player.name.full,
            //   position: player.primary_position,
            //   team: teamName
            // })
            // .then(res => {
            //   // Pass the user object to serialize function
            // //   done(null, { id: userId[0] });
            //     console.log(res)
            // })
            // .catch(err => {
            //   console.log('Error creating a user', err);
            // });
    //     })
    // });
//     start++;
// }

// knex('players')
// .select("*")
// .then(players => {
//     // If user is found, pass the user object to serialize function
//     console.log(players)
// });