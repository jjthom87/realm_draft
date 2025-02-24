const draftTimerIntervals = [];

let playerSearchValue = "";
let teamDraftSearchValue = "";
let availablePlayerSearchValue = "";
const teamsPlayersHtml = [];
const teamsDraftsHtml = [];
let keydownOnce = false;
let keydownOnceTeamDraft = false;
const commissioners = ["Help Us Mookie!", "Latrell Lamar", "RBI'd 4 Her Pleasure", "Sprokketts"];


let positionsMap = {
    "1B": "First Baseman",
    "2B": "Second Baseman",
    "3B": "Third Baseman",
    "C": "Catcher",
    "SP": "Pitcher",
    "RP": "Pitcher",
    "OF": "Outfielder",
    "SS": "Shortstop"
}

let teamsMap = {
    "New York Yankees": "NYY",
    "New York Mets": "NYM",
    "Chicago Cubs": "CHC",
    "Arizona Diamondbacks": "AZ",
    "Philadelphia Phillies": "PHI",
    "Athletics": "SAC",
    "San Francisco Giants": "SF",
    "San Diego Padres": "SD",
    "Los Angeles Dodgers": "LAD",
    "Los Angeles Angels": "LAA",
    "Boston Red Sox": "BOS",
    "Atlanta Braves": "ATL",
    "Cincinnati Reds": "CIN",
    "St. Louis Cardinals": "STL",
    "Cleveland Guardians": "CLE",
    "Pittsburgh Pirates": "PIT",
    "Chicago White Sox": "CWS",
    "Miami Marlins": "MIA",
    "Tampa Bay Rays": "TB",
    "Baltimore Orioles": "BAL",
    "Detroit Tigers": "DET",
    "Toronto Blue Jays": "TOR",
    "Kansas City Royals": "KC",
    "Milwaukee Brewers": "MIL",
    "Minnesota Twins": "MIN",
    "Houston Astros": "HOU",
    "Texas Rangers": "TEX",
    "Colorado Rockies": "COL",
    "Seattle Mariners": "SEA",
    "Washington Nationals": "WSH",
    
    "NYY": "New York Yankees",
    "NYM": "New York Mets",
    "CHC": "Chicago Cubs",
    "AZ": "Arizona Diamondbacks",
    "PHI": "Philadelphia Phillies",
    "SAC": "Athletics",
    "SF": "San Francisco Giants",
    "SD": "San Diego Padres",
    "LAD": "Los Angeles Dodgers",
    "LAA": "Los Angeles Angels",
    "BOS": "Boston Red Sox",
    "ATL": "Atlanta Braves",
    "CIN": "Cincinnati Reds",
    "STL": "St. Louis Cardinals",
    "CLE": "Cleveland Guardians",
    "PIT": "Pittsburgh Pirates",
    "CWS": "Chicago White Sox",
    "MIA": "Miami Marlins",
    "TB": "Tampa Bay Rays",
    "BAL": "Baltimore Orioles",
    "DET": "Detroit Tigers",
    "TOR": "Toronto Blue Jays",
    "KC": "Kansas City Royals",
    "MIL": "Milwaukee Brewers",
    "MIN": "Minnesota Twins",
    "HOU": "Houston Astros",
    "TEX": "Texas Rangers",
    "COL": "Colorado Rockies",
    "SEA": "Seattle Mariners",
    "WSH": "Washington Nationals"
}

async function getLoggedInUser(){
    return fetch("/auth/signed-in")
    .then(function(response){ 
        return response.json(); 
    })
    .then(function(res){ 
        return res;
    });
}

async function getDraft(){
    return fetch("/api/draft")
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){
            return res.data;
        })
}

async function getDraftTimer(){
    return fetch("/api/draft/timer")
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){
            return res;
        })
}

async function getTrades(){
    return fetch("/api/trades")
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){
            return res;
        })
}

async function getKeepers(team){
    let api = team != null ? `/api/keepers/${team}` : '/api/keepers'
    return fetch(api)
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){
            return res.data;
        })
}

async function getAllTeams(team){
    let api = team != null ? `/api/teams/${team}` : '/api/teams'
    return fetch(api)
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){
            return res.data;
        })
}

async function availablePlayersToDraft(){
    return await fetch("/api/players")
    .then(function(response){ 
        return response.json(); 
    })
    .then(async function(allPlayers){
        return await fetch("/api/draft/players")
        .then(function(response){ 
            return response.json(); 
        })
        .then(async function(draftPicks){
            return await fetch("/api/keepers")
            .then(function(response){ 
                return response.json(); 
            })
            .then(function(keepers){
                let players = allPlayers.data;
                let mappedPlayers = players.map((player)=> { 
                    return {details: player.name + ", " + teamsMap[player.team] + " - " + player.position, url: player.yahoo_url}
                })
                for(let i = 0; i < mappedPlayers.length; i++){
                    if(draftPicks.data.includes(mappedPlayers[i].details.split(",")[0])){
                        mappedPlayers.splice(i,1)
                    }
                    let mappedKeepers = keepers.data.map((keeper) => keeper.name);
                    if(mappedKeepers.includes(mappedPlayers[i].details.split(",")[0])){
                        mappedPlayers.splice(i,1)
                    }
                }
                return mappedPlayers;
            });
        });
    });
}

function startDraftTimer(){
    setTimeout(async () => {
        const draftInterval = setInterval(async () => {
            let loggedInUser = await getLoggedInUser();
            if(loggedInUser.user != null){
                let currentDraftPick = await getDraftTimer();
                if(currentDraftPick.data.draftPickDeadline && currentDraftPick.data.draftPickDeadline.toString().includes("5555")){
                    document.getElementById("continue-draft-button").style.display = "block";
                    document.getElementById("draft-paused-text").style.display = "block";
                } else if (new Date(currentDraftPick.data.draftPickDeadline) > new Date()){
                    document.getElementById("draft-timer").innerText = "Draft Pick Deadline: " + currentDraftPick.data.draftPickDeadline
                } else {
                    fetch("/api/draft/pick", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({round: currentDraftPick.data.round, pick: currentDraftPick.data.pick, draftPickDeadline: '6666-12-31 00:00:00'})
                    })
                    .then(function(response){ 
                        return response.json(); 
                    })
                    .then(function(res){
                        loadHtml(res, "block")
                    });
                }

                let currentPickElement = document.getElementById("current-pick");
                if(!currentPickElement){
                    clearInterval(draftInterval)
                } else {
                    const screenRound = currentPickElement.children[0].textContent;
                    const screenPick = currentPickElement.children[1].textContent;
    
                    const draft = await getDraft();
                    const amountOfDraftedPlayers = draft.filter((dp) => dp.name != null).length;
                    
                    const trs = document.getElementsByClassName("draft-tr")
                    let totalPlayerTrs = 0;
                    for(let i = 0; i < trs.length; i++){
                        if(trs[i].children[5].textContent != "PENDING" && trs[i].children[5].textContent != "Team"){
                            totalPlayerTrs++
                        }
                    }
    
                    if((currentDraftPick.data.round != screenRound || currentDraftPick.data.pick != screenPick) || (totalPlayerTrs != amountOfDraftedPlayers)){
                        let loggedInUser = await getLoggedInUser();
                        let res = {success: true, user: loggedInUser.user}
                        loadHtml(res, "block");
                    }
                }
                
            }
        },1000)
        draftTimerIntervals.push(draftInterval)
    }, 500)
}

async function startDraft(){
    let draft = await getDraft();
    let {user} = await getLoggedInUser();
    let draftHasNotStarted = draft.every(d => d.draftPickDeadline.toString().includes('9999'))

    if(user == null){
        loadHtml({success: false}, "none")
    } else {
        if(draftHasNotStarted){
            loadHtml({success: true, user}, "none")
        } else {
            startDraftTimer()
        }
    }
}
startDraft();

async function loadHtml(res, draftDisplay){
    if(res.success){
        let draft = await getDraft();
        let allKeepers = await getKeepers();
        const trades = await getTrades();

        document.getElementById("loader-div").style.display = "block";
        
        let user = res.user

        document.getElementById("page-container").innerHTML = "";
        let html = "";

        let welcomeHtml = "<h3>Welcome " + res.user + "</h3>";

        let buttonsHtml = '<div><button style="margin: 2px; color: black;" id="show-draft-button">Draft</button><button style="margin: 2px;" id="show-keepers-button">Keepers</button><button style="margin: 2px;" id="show-all-teams-button">Teams</button><button style="margin: 2px;" id="show-all-available-players-button">Available Players</button><button style="margin: 2px;" id="show-rosters-draft-picks-button">Rosters | Draft Picks</button>'
        let displayAsterisk = trades.data.filter((t) => t.receiver == user && !t.approved_by_receiver && !t.trade_rejected && !t.commissioner_approved).length > 0 ? "*" : ""
        buttonsHtml += '<button style="margin: 2px;" id="show-trades-button">Trades'+displayAsterisk+'</button>'
        buttonsHtml += '</div>'


        let draftHtml = `<button id="start-draft-button" style="display: none">Start Draft</button><h1 id='draft-paused-text' style='color: orange; display: none;'>Draft Paused</h1><button id='continue-draft-button' style='color: green; display: none; background-color: black; font-size: 31px;'>Continue Draft</button><div id="draft-section" style="display: ${draftDisplay};">`;

        draftHtml += "<span id='draft-controls-section'><span style='float: right;'>Confirm Reset <input type='checkbox' id='confirm-reset-checkbox' /></span><button disabled style='background-color: red; color: white; float: right;' id='reset-draft-button'>Reset Draft</button><button style='background-color: orange; color: white; float: right;' id='pause-draft-button'>Pause Draft</button><br>"
        draftHtml += `<p><div style='float: right;'><input placeholder='seconds, minutes, or hours i.e. 10 seconds' style='width: 275px;' id='set-timer-input'/><button id='set-timer-button'>Set Timer</button></div></p></span><br><br>`

        let lastPick = draft.filter((dp) => dp.name != null).pop();
        if(lastPick == undefined){
            lastPick = draft[0]
        } else {
            let lastPickHtml = `<p>Round ${lastPick.round} Pick ${lastPick.pick}, ${lastPick.team} selects <span style="color: orange;">${lastPick.name} (${lastPick.position})</span> from the ${lastPick.player_team}</p>`
            draftHtml += lastPickHtml;
        }

        let currentDraftPick = draft.find((dp) => dp.name == null && !dp.draftPickDeadline.includes('6666'));
        let draftHasStarted = draft.some(d => !d.draftPickDeadline.toString().includes('9999'));

        if(draftHasStarted){
            let draftTimer = await getDraftTimer();
            let draftTimerHtml = `<p id='draft-timer'>Timer: ${draftTimer.draftPickDeadline != null ? draftTimer.draftPickDeadline.toString() : 'PENDING'}</p>`
            draftHtml += draftTimerHtml;
    
            let currentPickHtml = `<a href=#current-pick>Current Pick - Team: ${currentDraftPick.team}, Round: ${currentDraftPick.round}, Pick: ${currentDraftPick.pick}</a>`
    
            draftHtml += currentPickHtml;
            draftHtml += "<table>";
            draftHtml += '<thead><tr><th scope="col">Round</th><th scope="col">Pick</th><th scope="col">Overall Pick</th><th scope="col">Fantasy Team</th><th scope="col">Player</th><th scope="col">Team</th><th scope="col">Position</th></tr></thead>';
    
            let draftTable = ""
            let current = draft.find((dp) => dp.name == null && !dp.draftPickDeadline.includes('6666'));
            draft.forEach((dp) => {
                let userHtml = dp.team == user ? 'style="color: red"' : ''
    
                if(dp.name == null){
                    if(dp.round == current.round && dp.pick == current.pick){
                        // if(dp.team == user){
                                draftTable += `<tr class='draft-tr' style='background-color: #add898; font-weight: bold;' id='current-pick'><th scope="row">${dp.round}</th><td>${dp.pick}</td><td>${((dp.round - 1) * 14) + dp.pick}</td><td ${userHtml}>${dp.team}</td><td><input round=${dp.round} pick=${dp.pick} id='player-pick-input'/><button id='submit-player-pick' style='border: 2px solid black;'>Submit Pick</button></td><td>PENDING</td><td>PENDING</td></tr>`
                        // } else {
                        //     draftTable += `<tr class='draft-tr' style='background-color: #add898;' id='current-pick'><th scope="row">${dp.round}</th><td>${dp.pick}</td><td ${userHtml}>${dp.team}</td><td style="color: #27477f">CURRENT PICK</td><td>PENDING</td></tr>`   
                        // }
                    } else if (dp.draftPickDeadline.includes('6666')){
                        // if(dp.team == user){
                            draftTable += `<tr class='draft-tr' style='background-color: #FF7F7F; font-weight: bold;' id='round-${dp.round}-pick-${dp.pick}'><th scope="row">${dp.round}</th><td>${dp.pick}</td><td>${((dp.round - 1) * 14) + dp.pick}</td><td ${userHtml}>${dp.team}</td><td><input round=${dp.round} pick=${dp.pick} class='missed-player-pick-input'/><button class='submit-missed-player-pick' style='border: 2px solid black;'>Submit Pick</button></td><td>PENDING</td><td>PENDING</td></tr>`
                        // } else {
                        //     draftTable += `<tr class='draft-tr' style='background-color: #FF7F7F;'><th scope="row">${dp.round}</th><td>${dp.pick}</td><td ${userHtml}>${dp.team}</td><td>MISSED PICK</td><td>PENDING</td></tr>`   
                        // }
                    } else {
                        draftTable += `<tr class='draft-tr' id='round-${dp.round}-pick-${dp.pick}'><th scope="row">${dp.round}</th><td>${dp.pick}</td><td>${((dp.round - 1) * 14) + dp.pick}</td><td ${userHtml}>${dp.team}</td><td>PENDING</td><td>PENDING</td><td>PENDING</td></tr>`
                    }
                } else {
                    draftTable += `<tr class='draft-tr' id='round-${dp.round}-pick-${dp.pick}'><th scope="row">${dp.round}</th><td>${dp.pick}</td><td>${((dp.round - 1) * 14) + dp.pick}</td><td ${userHtml}>${dp.team}</td><td>${dp.name}</td><td>${dp.player_team == "null" ? "Team Pending" : dp.player_team}</td><td>${dp.position}</td></tr>`
                }
            });
            draftHtml += draftTable
            draftHtml += '</table></div>'
        } else {
            let draftTimerHtml = `<p id='draft-timer' style="display:none;">/p>`
            draftHtml += draftTimerHtml;
    
            draftHtml += "<table>";
            draftHtml += '<thead><tr><th scope="col">Round</th><th scope="col">Pick</th><th scope="col">Overall Pick</th><th scope="col">Fantasy Team</th><th scope="col">Player</th><th scope="col">Team</th><th scope="col">Position</th></tr></thead>';
    
            let draftTable = ""
            let current = draft.find((dp) => dp.name == null && !dp.draftPickDeadline.includes('6666'));
            draft.forEach((dp) => {
                let userHtml = dp.team == user ? 'style="color: red"' : ''
    
                if (dp.draftPickDeadline.includes('6666')){
                    if(!dp.name){
                        // if(dp.team == user){
                            draftTable += `<tr class='draft-tr' style='background-color: #FF7F7F; font-weight: bold;' id='round-${dp.round}-pick-${dp.pick}'><th scope="row">${dp.round}</th><td>${dp.pick}</td><td>${((dp.round - 1) * 14) + dp.pick}</td><td ${userHtml}>${dp.team}</td><td><input round=${dp.round} pick=${dp.pick} class='missed-player-pick-input'/><button class='submit-missed-player-pick' style='border: 2px solid black;'>Submit Pick</button></td><td>PENDING</td><td>PENDING</td></tr>`
                        // } else {
                        //     draftTable += `<tr style='background-color: #FF7F7F;'><th scope="row">${dp.round}</th><td>${dp.pick}</td><td ${userHtml}>${dp.team}</td><td>MISSED PICK</td><td>PENDING</td></tr>`   
                        // }
                    } else {
                        // if(dp.team == user){
                            draftTable += `<tr class='draft-tr' id='round-${dp.round}-pick-${dp.pick}'><th scope="row">${dp.round}</th><td>${dp.pick}</td><td>${((dp.round - 1) * 14) + dp.pick}</td><td ${userHtml}>${dp.team}</td><td>${dp.name}</td><td>${dp.player_team == "null" ? "Team Pending" : dp.player_team}</td><td>${dp.position}</td></tr>`
                            // } else {
                            //     draftTable += `<tr style='background-color: #FF7F7F;'><th scope="row">${dp.round}</th><td>${dp.pick}</td><td ${userHtml}>${dp.team}</td><td>MISSED PICK</td><td>PENDING</td></tr>`   
                            // }
                    }
                } else {
                    draftTable += `<tr class='draft-tr' id='round-${dp.round}-pick-${dp.pick}'><th scope="row">${dp.round}</th><td>${dp.pick}</td><td>${((dp.round - 1) * 14) + dp.pick}</td><td ${userHtml}>${dp.team}</td><td>${dp.name}</td><td>${dp.player_team == "null" ? "Team Pending" : dp.player_team}</td><td>${dp.position}</td></tr>`
                }
            });
            draftHtml += draftTable
            draftHtml += '</table></div>'
        }

        let keepersHtml = "<div id='keepers-section' style='display: none; margin-left: -38px;'><ul style='list-style-type: none;'>"
        let teamKeepers = await getKeepers(user.split("&").join(""))
        teamKeepers.forEach((tk) => {
            keepersHtml += `<li><input class="keepers-checkbox" type="checkbox" ${tk.keeper == 1 ? 'checked' : ''} value=${tk.name.split(" ").join("&")} /> ${tk.name}, ${teamsMap[tk.player_team]} - ${tk.position}</li>`
        })
        keepersHtml += "</ul></div>"

        let allTeamsSectionHtml = "<div id='all-teams-section' style='display: none;'><br><input id='search-team-player' placeholder='Search Player or Team Name' style='width: 200px; display: block; margin: 0 auto;'/><h4 style='color: red; text-align: center;'>*keeper</h4><br><div id='all-teams-div' style='display: flex; flex-flow: wrap;'>";
        let fantasyTeams = await getAllTeams();
        let teamNames = new Set(fantasyTeams.map((team) => team.team))
        let allTeamsMap = {};
        fantasyTeams.forEach((team) => {
            if(allTeamsMap[team.team] == null){
                allTeamsMap[team.team] = [];
            }
            allTeamsMap[team.team].push(team.name  + ", " + teamsMap[team.player_team] + " - " + team.position)
        })
        teamNames.forEach((teamName) => {
            allTeamsSectionHtml += `<div class='well teams-players-well' id="${teamName.split(" ").join("&")}-well" style='width: 300px; margin: 3px;'><h3>${teamName}</h3><ul id="${teamName.split(" ").join("&")}-team-list" style='list-style-type: none;'>`
            allTeamsMap[teamName].forEach((player) => {
                if(allKeepers.map((k) => k.name).includes(player.split(", ")[0])){
                    allTeamsSectionHtml += "<li class='team-player-li' style='margin-left: -40px; color: red;'>"+player+"</li>"
                } else {
                    allTeamsSectionHtml += "<li class='team-player-li' style='margin-left: -40px;'>"+player+"</li>"
                }
            })
            allTeamsSectionHtml += "</ul></div>"
        })
        allTeamsSectionHtml += "</div></div>"
        
        let allAvailablePlayersHtml = "<div id='all-available-players-section' style='display: none;'><br><input id='search-available-player' placeholder='Search Available Player' style='width: 200px;'/><br>"
        let positions = ["C", "1B", "2B", "3B", "SS", "OF", "SP", "RP", "P", "Util"]
        allAvailablePlayersHtml += "<select style='margin: 2px;' id='all-available-players-position-filter'>"
        allAvailablePlayersHtml += '<option value="" disabled selected hidden>Select Position</option>'
        allAvailablePlayersHtml += '<option value="all positions">All Positions</option>'
        positions.forEach((position)=>{
            allAvailablePlayersHtml += "<option value="+position+">"+position+"</option>"
        })
        allAvailablePlayersHtml += "</select>"
        allAvailablePlayersHtml += "<select style='margin: 2px;' id='all-available-players-team-filter'>"
        allAvailablePlayersHtml += '<option value="" disabled selected hidden>Select MLB Team</option>'
        allAvailablePlayersHtml += '<option value="all teams">All Teams</option>'

        const allMlbTeamNames = []
        Object.keys(teamsMap).forEach((team, index) => {
            if(index < 30){
                allMlbTeamNames.push(team);
            }
        })
        allMlbTeamNames.sort().forEach((mlbTeam) => {
            allAvailablePlayersHtml += `<option value='${mlbTeam}'>${mlbTeam}</option>`;
        })
        allAvailablePlayersHtml += "</select>"
        allAvailablePlayersHtml += "<br><br>"
        allAvailablePlayersHtml += "<ul id='available-players-ul' style='list-style-type: none;'>"
        availablePlayersToDraft().then((availablePlayersToDraft) => {
            availablePlayersToDraft.forEach((availablePlayerToDraft) => {
                allAvailablePlayersHtml += "<li class='available-players-li'><a href='"+availablePlayerToDraft.url+"' target='_blank'>"+availablePlayerToDraft.details+"</a></li>";
            })

            allAvailablePlayersHtml += "</ul></div>"

            let allFantasyTeamNames = ["Big Wood Bison", "Dynasty Makers", "Help Us Mookie!", "HeRowe Keepers", "Latrell Lamar", "Loss of Foresight", "All that YAZ", "Prestige Worldwide", "Radioactive Moose", "RBI'd 4 Her Pleasure", "Murderers' Row", "Sprokketts", "Take it Deep", "Ya Gotta Believe"];
            allFantasyTeamNames.splice(allFantasyTeamNames.indexOf(user), 1);
            allFantasyTeamNames.unshift(user)

            let allRosterDraftPicksHtml = "<div id='rosters-draft-picks-section' style='display: none;'><br><input id='search-team' placeholder='Search by Team Name' style='width: 200px; display: block; margin: 0 auto;'/><br><div style='display: flex; flex-flow: wrap;' id='rosters-draft-picks-div'><br>"
            let allRostersDraftPicks = {};
            allFantasyTeamNames.forEach((team) => {
                allRostersDraftPicks[team] = {draft: [], keepers: []}
            });
            draft.forEach((dp) => {
                allRostersDraftPicks[dp.team].draft.push(dp);
            })
            allKeepers.forEach((k) => {
                allRostersDraftPicks[k.team].keepers.push(k)
            })

            for(i in allRostersDraftPicks){
                allRosterDraftPicksHtml += `<div class='well teams-drafts-well' id="${i.split(" ").join("&")}-well-2" style='width: 300px; margin: 3px;'><h1 class='teams-draft-team-name'>${i}</h1><ul id="${i.split(" ").join("&")}-team-list" style='list-style-type: none;'>`
                allRosterDraftPicksHtml += "<h2>Keepers</h2>";
                allRosterDraftPicksHtml += "<ul style='list-style-type: none;'>"
                allRostersDraftPicks[i].keepers.forEach((p) => {
                    allRosterDraftPicksHtml += "<li style='margin-left: -60px;'>" + p.name + ", " + teamsMap[p.player_team] + " - " + p.position + "</li>"
                })
                allRosterDraftPicksHtml += "</ul>"
                allRosterDraftPicksHtml += "<h2>Draft</h2>";
                allRosterDraftPicksHtml += "<h3>Players Picked</h3>";
                allRosterDraftPicksHtml += "<ul style='list-style-type: none;'>"
                allRostersDraftPicks[i].draft.filter((p) => p.name != null).forEach((p) => {
                    allRosterDraftPicksHtml += "<li style='margin-left: -60px;'>" + p.name + ", " + teamsMap[p.player_team] + " - " + p.position + "</li>"
                })
                allRosterDraftPicksHtml += "</ul>";
                allRosterDraftPicksHtml += "<h3>Draft Picks Left</h3>";
                allRostersDraftPicks[i].draft.filter((p) => p.name == null).forEach((dp) => {
                    allRosterDraftPicksHtml += "<li>Round: " + dp.round + ", Pick: " + dp.pick + "</li>"
                })
                allRosterDraftPicksHtml += "</ul>"
                allRosterDraftPicksHtml += "</div>";
            }
            allRosterDraftPicksHtml += "</div>";
            allRosterDraftPicksHtml += "</div>";

            let allTradesHtml = "<div id='trades-section' style='display: none;'>"
            allTradesHtml += "<h2>All Trades</h2>"
            const allTrades = trades.data.filter((t) => t.updated_in_yahoo)
            allTradesHtml += "<h3>All Trades</h3><table>"
            allTradesHtml += '<thead><tr><th scope="col">Team 1</th><th scope="col">Team 1 Gets</th><th scope="col">Team 2</th><th scope="col">Team 2 Gets</th></tr></thead>';
            allTrades.forEach((t) => {
                allTradesHtml += '<tr><td>' + t.receiver + '</td><td>' + t.receiver_players.split(",").join("<br>") + '</td><td>'+t.initiator+'</td><td>' + t.initiator_players.split(",").join("<br>") + '</td>';
            })
            allTradesHtml += "</table>"
            allTradesHtml += "</div>"
            // allTradesHtml += "<h2>Your Open Trades</h2>"
            // const yourTrades = trades.data.filter((t) => t.initiator == user || t.receiver == user)
            // const tradesYouInitiated = trades.data.filter((t) => t.initiator == user)
            // const tradesTheyInitiated = trades.data.filter((t) => t.receiver == user)
            // const yourRejectedTrades = trades.data.filter((t) => (t.initiator == user || t.receiver == user) && t.rejected)
            // const yourApprovedTrades = trades.data.filter((t) => (t.initiator == user || t.receiver == user) && t.approved_by_receiver && t.commissioners_who_approved.split(",").length == 4)
            
            // if(yourTrades.length > 0){
            //     if(tradesYouInitiated.length > 0){
            //         allTradesHtml += "<h3>Trades to Them</h3><table>"
            //         allTradesHtml += '<thead><tr><th scope="col">Receiver</th><th scope="col">You\'re Giving</th><th scope="col">You\'re Requesting</th><th scope="col">Status</th></tr></thead>';
            //         tradesYouInitiated.forEach((t) => {
            //             if(!t.approved_by_receiver && !t.commissioner_approved && !t.rejected){
            //                 allTradesHtml += '<tr><td>' + t.receiver + '</td><td>' + t.initiator_players.split(",").join("<br>") + '</td><td>' + t.receiver_players.split(",").join("<br>") + '</td><td>Awaiting Approval from ' + t.receiver + '</td>';
            //             } else if (t.approved_by_receiver && !t.commissioner_approved && !t.rejected){
            //                 allTradesHtml += '<tr><td>' + t.receiver + '</td><td>' + t.initiator_players.split(",").join("<br>") + '</td><td>' + t.receiver_players.split(",").join("<br>") + '</td><td>Awaiting Approval from a Commish</td>';
            //             }
            //         })
            //         allTradesHtml += "</table>"
            //     }
            //     if(tradesTheyInitiated.length > 0){
            //         allTradesHtml += "<h3>Trades to You</h3><table>"
            //         allTradesHtml += '<thead><tr><th scope="col">Initiator</th><th scope="col">They\'re Giving</th><th scope="col">They\'re Requesting</th><th scope="col">Status</th></tr></thead>';
            //         tradesTheyInitiated.forEach((t) => {
            //             if(!t.approved_by_receiver && !t.commissioner_approved){
            //                 allTradesHtml += '<tr><td>' + t.initiator + '</td><td>' + t.initiator_players.split(",").join("<br>") + '</td><td>' + t.receiver_players.split(",").join("<br>") + '</td><td><button class="accept-trade-button" value='+t.ID+'>Accept Trade</button>&nbsp;<button class="reject-trade-button" value='+t.ID+'>Reject Trade</button></td>';
            //             } else if (t.approved_by_receiver && !t.commissioner_approved){
            //                 allTradesHtml += '<tr><td>' + t.initiator + '</td><td>' + t.initiator_players.split(",").join("<br>") + '</td><td>' + t.receiver_players.split(",").join("<br>") + '</td><td>Awaiting Commissioner Approval</td>';
            //             } 
            //         })
            //         allTradesHtml += "</table>"
            //     }
            //     if(yourApprovedTrades.length > 0){
            //         allTradesHtml += "<h3>Your Approved Trades</h3><table>"
            //         allTradesHtml += '<thead><tr><th scope="col">Other Party</th><th scope="col">They Gave</th><th scope="col">You Gave</th><th scope="col">Processed</th></tr></thead>';
            //         yourApprovedTrades.forEach((t) => {
            //             allTradesHtml += '<tr><td>' + (t.initiator == user ? t.receiver : t.initiator) + '</td><td>' + (t.initiator == user ? t.receiver_players.split(",").join("<br>") : t.initiator_players.split(",").join("<br>")) + '</td><td>' + (t.initiator == user ? t.initiator_players.split(",").join("<br>") : t.receiver_players.split(",").join("<br>")) + '</td><td>' + (t.updated_in_yahoo ? "Yes" : "No") + '</td>';
            //         })
            //         allTradesHtml += "</table>"
            //     }
                // if(yourRejectedTrades.length > 0){
                //     allTradesHtml += "<h3>Your Rejected Trades</h3><table>"
                //     allTradesHtml += '<thead><tr><th scope="col">Initiator</th><th scope="col">They\'re Giving</th><th scope="col">They\'re Requesting</th></tr></thead>';
                //     tradesTheyInitiated.forEach((t) => {
                //         if(!t.approved_by_receiver && !t.commissioner_approver){
                //             allTradesHtml += '<tr><td>' + t.initiator + '</td><td>' + t.initiator_players.split(",").join("<br>") + '</td><td>' + t.receiver_players.split(",").join("<br>") + '</td>';
                //         }
                //     })
                //     allTradesHtml += "</table>"
                // }
            // }
            // const commishTrades = trades.data.filter((t) => t.approved_by_receiver && !t.commissioner_approved && commissioners.includes(user) && t.initiator != user && t.receiver != user && !t.commissioners_who_approved.split(",").includes(user))
            // if(commishTrades.length > 0){
            //     allTradesHtml += "<h3>Trades Awaiting Commissioner Approval</h3><table>"
            //     allTradesHtml += '<thead><tr><th scope="col">Initiator</th><th scope="col">Initiator Giving</th><th scope="col">Receiver</th><th scope="col">Receiver Receiving</th><th scope="col">Action</th></tr></thead>';
            //     commishTrades.forEach((t) => {
            //         allTradesHtml += '<tr><td>' + t.initiator + '</td><td>' + t.initiator_players.split(",").join("<br>") + '</td><td>' + t.receiver + '</td><td>' + t.receiver_players.split(",").join("<br>") + '</td><td><button class="accept-trade-button commish-trade-button" value='+t.ID+'>Approve Trade</button>&nbsp;<button class="reject-trade-button commish-trade-button" value='+t.ID+'>Reject Trade</button></td>';
            //     })
            //     allTradesHtml += "</table>";
            // }

            // const allApprovedTrades = trades.data.filter((t) => t.approved_by_receiver && t.commissioners_who_approved.split(",").length == 4)

            // allTradesHtml += "<h2>Who would you like to trade with?</h2>"
            // allTradesHtml += "<select id='team-to-trade-with'>"
            // allTradesHtml += '<option value="" disabled selected hidden>Select Team</option>'
            // allFantasyTeamNames.filter((team) => team != user).forEach((team) => {
            //     allTradesHtml += "<option value="+team.split(" ").join("+")+">"+team+"</option>"
            // })
            // allTradesHtml += "</select>"
            // allTradesHtml += "<div id='make-trade-div'></div>"
            allTradesHtml += "</div>"

            html += welcomeHtml
            html += buttonsHtml
            html += draftHtml
            html += keepersHtml
            html += allTeamsSectionHtml
            html += allAvailablePlayersHtml
            html += allRosterDraftPicksHtml
            html += allTradesHtml

            document.getElementById("page-container").innerHTML = html;

            document.getElementById("loader-div").style.display = "none";
        })
    } else {
        document.getElementById("page-container").innerHTML = "";
        let html = ""
        let signInHtml = '<h3>Sign In</h3><div class="well"><form id="sign-in-form"><label>Username</label><br><input type="text" id="username-input"/><br><label>Password</label><br><input type="password" id="password-input"/><br><br><input class="btn btn-danger" id="sign-in-form-submit" type="submit"></form></div>'
        html += signInHtml
        document.getElementById("page-container").innerHTML = html;
    }
}

async function showCorrectSection(inputSection){
    let draft = await getDraft()
    const sections = ["keepers", "all-teams", "all-available-players", "trades", "rosters-draft-picks"];
    sections.forEach((section)=>{
        if(section == inputSection){
            document.getElementById("start-draft-button").style.display = "none"
            document.getElementById(section + "-section").style.display = document.getElementById(section+"-section").style.display == "none" ? "block" : "none"
            document.getElementById("show-"+section+"-button").style.color = document.getElementById(section+"-section").style.display == "none" ? "black" : "red"
        } else {
            document.getElementById(section+"-section").style.display = "none";
            document.getElementById("show-"+section+"-button").style.color = "black";
        }
    })

    if (inputSection == "draft"){
        if(document.getElementById("show-draft-button").style.color == "red"){
            document.getElementById("draft-section").style.display = "none"
            document.getElementById("start-draft-button").style.display = "none"
            document.getElementById("show-draft-button").style.color = "black"
        } else {
            let draftHasNotStarted = draft.every(d => d.draftPickDeadline.toString().includes('9999'));
            let draftIsPaused = draft.some(d => d.draftPickDeadline.toString().includes('5555'));
            if(draftHasNotStarted){
                document.getElementById("start-draft-button").style.display = "block"
                document.getElementById("draft-section").style.display = "block"
                document.getElementById("draft-controls-section").style.display = "none"
            } else if (draftIsPaused){
                document.getElementById("draft-section").style.display = "block"
                document.getElementById("draft-controls-section").style.display = "none"
            } else {
                document.getElementById("draft-controls-section").style.display = "block"
                document.getElementById("draft-section").style.display = "block"
            }
            document.getElementById("show-draft-button").style.color = document.getElementById("show-draft-button").style.color == "black" ? "red" : "black"
        }
    } else {
        document.getElementById("draft-section").style.display = "none"
        document.getElementById("start-draft-button").style.display = "none"
        document.getElementById("show-draft-button").style.color = "black"
    }
}

setTimeout(() => {
    fetch("/auth/signed-in")
    .then(function(response){ 
        return response.json(); 
    })
    .then(function(res){ 
        loadHtml(res, "none")
    });
}, 100);

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
        //   if (arr[i].split(",")[0].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          if (arr[i].split(",")[0].toUpperCase().includes(val.toUpperCase())) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            b.classList.add("player-search-results")
            /*make the matching letters bold:*/
            b.innerHTML = `<strong>${arr[i].substr(0, val.length)}</strong>`;
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += `<input type='hidden' value="${arr[i]}">`;
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
    document.getElementsByTagName("body")[0].addEventListener("mouseover", function(e){
        if(e.target.parentElement && e.target.parentElement.classList.contains('autocomplete-items')){
            var x = document.getElementsByClassName("autocomplete-items")[0].children;
            for(let i = 0; i < x.length; i++){
                if(x[i].innerText == e.target.innerText){
                    currentFocus = i
                }
            }
            addActive(x)
        }
    })
  }

document.getElementsByTagName("body")[0].addEventListener("keydown", function(e){
    if(e.target.id == "player-pick-input"){
        availablePlayersToDraft().then((availablePlayersToDraft) => {
            const availablePlayersToDraftDetails = availablePlayersToDraft.map((ap) => ap.details)
            autocomplete(document.getElementById("player-pick-input"), availablePlayersToDraftDetails)
        })
    } else if (e.target.classList.contains("missed-player-pick-input")){
        availablePlayersToDraft().then((availablePlayersToDraft) => {
            const availablePlayersToDraftDetails = availablePlayersToDraft.map((ap) => ap.details)
            autocomplete(e.target, availablePlayersToDraftDetails)
        }) 
    } else if (e.target.id == "search-team-player"){
        let teamsPlayersSections = document.getElementsByClassName('teams-players-well');
        if(!keydownOnce){
            for(let i = 0; i < teamsPlayersSections.length; i++){
                teamsPlayersHtml.push(teamsPlayersSections[i].outerHTML)
            }
            keydownOnce = true;
        }
        
        if(e.key == "Backspace"){
            playerSearchValue = playerSearchValue.substring(0, playerSearchValue.length - 1)
        } else {
            playerSearchValue += e.key
        }

        let playerSearchHtml = "";
        for(let i = 0; i < teamsPlayersHtml.length; i++){
            if(teamsPlayersHtml[i].toLowerCase().includes("á")){
                teamsPlayersHtml[i] = teamsPlayersHtml[i].replaceAll("á", "a")
            }
            if (teamsPlayersHtml[i].toLowerCase().includes("é")){
                teamsPlayersHtml[i] = teamsPlayersHtml[i].replaceAll("é", "e")
            }
            if (teamsPlayersHtml[i].toLowerCase().includes("ó")){
                teamsPlayersHtml[i] = teamsPlayersHtml[i].replaceAll("ó", "o")
            }
            if (teamsPlayersHtml[i].toLowerCase().includes("í")){
                teamsPlayersHtml[i] = teamsPlayersHtml[i].replaceAll("í", "i")
            }
            if (teamsPlayersHtml[i].toLowerCase().includes("ñ")){
                teamsPlayersHtml[i] = teamsPlayersHtml[i].replaceAll("ñ", "n")
            }
            if(teamsPlayersHtml[i].toLowerCase().includes('<li class="team-player-li"') && teamsPlayersHtml[i].toLowerCase().includes(playerSearchValue.toLowerCase())){
                const parser = new DOMParser();
                const doc = parser.parseFromString(teamsPlayersHtml[i], "application/xml");
                const playerListItems = doc.children[0].children[1].children
                for(let j = 0; j < playerListItems.length; j++){
                    if(playerListItems[j].innerHTML.toLowerCase().includes(playerSearchValue.toLowerCase())){
                        if(playerSearchValue != ""){
                            playerListItems[j].classList.add("highlight-row");
                        }
                    }
                }
                const serializer = new XMLSerializer();
                const xmlStr = serializer.serializeToString(doc);
                playerSearchHtml += xmlStr
            }
        }
        document.getElementById("all-teams-div").innerHTML = playerSearchHtml;
    } else if (e.target.id == "search-team"){
        let teamsDraftSections = document.getElementsByClassName('teams-drafts-well');
        let teamNames = document.getElementsByClassName('teams-draft-team-name')
        if(!keydownOnceTeamDraft){
            for(let i = 0; i < teamsDraftSections.length; i++){
                let teamObj = {};
                teamObj["html"] = teamsDraftSections[i].outerHTML
                teamObj["teamName"] = teamNames[i].outerHTML.split('<h1 class="teams-draft-team-name">').join("").split("</h1>")[0]
                teamsDraftsHtml.push(teamObj)
            }
            keydownOnceTeamDraft = true;
        }
        
        if(e.key == "Backspace"){
            teamDraftSearchValue = teamDraftSearchValue.substring(0, teamDraftSearchValue.length - 1)
        } else {
            teamDraftSearchValue += e.key
        }

        let teamDraftSearchHtml = "";
        console.log(teamsDraftsHtml)
        for(let i = 0; i < teamsDraftsHtml.length; i++){
            if(teamsDraftsHtml[i].teamName.toLowerCase().includes(teamDraftSearchValue.toLowerCase())){
                teamDraftSearchHtml += teamsDraftsHtml[i].html;
            }
        }
        document.getElementById("rosters-draft-picks-div").innerHTML = teamDraftSearchHtml;
    } else if (e.target.id == "search-available-player"){
        let positionDropdownValue = document.getElementById("all-available-players-position-filter").value;
        let teamDropdownValue = document.getElementById("all-available-players-team-filter").value;

        if(e.key == "Backspace"){
            availablePlayerSearchValue = availablePlayerSearchValue.substring(0, availablePlayerSearchValue.length - 1)
        } else {
            availablePlayerSearchValue += e.key
        }

        let filteredPlayers = ""
        availablePlayersToDraft().then((availablePlayersToDraft) => {
            availablePlayersToDraft.forEach((availablePlayerToDraft) => {
                const playerDetails = availablePlayerToDraft.details;
                const playerUrl = availablePlayerToDraft.url;
                let playerName = playerDetails.split(", ")[0];
                if(playerName.includes("á")){
                    playerName = playerName.replaceAll("á", "a")
                }
                if (playerName.includes("é")){
                    playerName = playerName.replaceAll("é", "e")
                } 
                if (playerName.includes("ó")){
                    playerName = playerName.replaceAll("ó", "o")
                } 
                if (playerName.includes("í")){
                    playerName = playerName.replaceAll("í", "i")
                }
                if (playerName.includes("ñ")){
                    playerName = playerName.replaceAll("ñ", "n")
                }
    
                const playerTeam = teamsMap[playerDetails.split(", ")[1].split(" - ")[0]]
                const playerPosition = playerDetails.split(", ")[1].split(" - ")[1];
    
                if(positionDropdownValue != "" && teamDropdownValue != ""){
                    if(positionDropdownValue == "all positions" && teamDropdownValue == "all teams"){
                        if(playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase())){
                            filteredPlayers += "<li class='available-players-li'><a href='"+playerUrl+"' target='_blank'>"+playerDetails+"</a></li>";
                        }
                    } else if (positionDropdownValue != "all positions" & teamDropdownValue == "all teams"){
                        if(playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase()) && playerPosition.includes(positionDropdownValue)){
                            filteredPlayers += "<li class='available-players-li'><a href='"+playerUrl+"' target='_blank'>"+playerDetails+"</a></li>";
                        }
                    } else if (positionDropdownValue == "all positions" & teamDropdownValue != "all teams"){
                        if(playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase()) && teamDropdownValue == playerTeam){
                            filteredPlayers += "<li class='available-players-li'><a href='"+playerUrl+"' target='_blank'>"+playerDetails+"</a></li>";
                        }
                    } else {
                        if(playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase()) && playerPosition.includes(positionDropdownValue) && teamDropdownValue == playerTeam){
                            filteredPlayers += "<li class='available-players-li'><a href='"+playerUrl+"' target='_blank'>"+playerDetails+"</a></li>";
                        }
                    }
                } else if (positionDropdownValue != "" && teamDropdownValue == ""){
                    if (positionDropdownValue == "all positions"){
                        if(playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase())){
                            filteredPlayers += "<li class='available-players-li'><a href='"+playerUrl+"' target='_blank'>"+playerDetails+"</a></li>";
                        }
                    } else {
                        if(playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase()) && playerPosition.includes(positionDropdownValue)){
                            filteredPlayers += "<li class='available-players-li'><a href='"+playerUrl+"' target='_blank'>"+playerDetails+"</a></li>";
                        }
                    }
                } else if (positionDropdownValue == "" && teamDropdownValue != ""){
                    if (teamDropdownValue == "all teams"){
                        if(playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase())){
                            filteredPlayers += "<li class='available-players-li'><a href='"+playerUrl+"' target='_blank'>"+playerDetails+"</a></li>";
                        }
                    } else {
                        if(playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase()) && teamDropdownValue == playerTeam){
                            filteredPlayers += "<li class='available-players-li'><a href='"+playerUrl+"' target='_blank'>"+playerDetails+"</a></li>";
                        }
                    }
                } else {
                    if(playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase())){
                        filteredPlayers += "<li class='available-players-li'><a href='"+playerUrl+"' target='_blank'>"+playerDetails+"</a></li>";
                    }
                }
            })
            document.getElementById("available-players-ul").innerHTML = filteredPlayers;
        })
    }
});

document.getElementsByTagName("body")[0].addEventListener("click", async function(e){
    if(e.target.id == "sign-in-form-submit"){
        document.getElementById("sign-in-form").addEventListener("submit", function(e){
            e.preventDefault();
        
            var signInObj = {
                username: document.getElementById('username-input').value,
                password: document.getElementById('password-input').value
            }
        
            fetch("/auth/sign-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(signInObj)
            })
            .then(function(response){ 
                return response.json(); 
            })
            .then(function(res){ 
                if(!res.success){
                    if(res.info.message === "incorrect password"){
                        alert("Incorrect Password for username")
                    } else if (res.info.message === "no user"){
                        alert("Username does not exist")
                    }
                } else {
                    startDraft()
                    loadHtml(res, "none")
                }
            });
        
        })  
    } else if (e.target.id == "submit-player-pick"){
        let playerPickInput = document.getElementById("player-pick-input");
        let playerPick = playerPickInput.value;

        availablePlayersToDraft().then((availablePlayersToDraft) => {
            const availablePlayersToDraftDetails = availablePlayersToDraft.map((ap) => ap.details)
            if(availablePlayersToDraftDetails.includes(playerPick)){
                const draftPickObject = {
                    round: playerPickInput.getAttribute("round"),
                    pick: playerPickInput.getAttribute("pick"),
                    name: playerPick.split(",")[0],
                    player_team: teamsMap[playerPick.split(", ")[1].split(" - ")[0]],
                    position: playerPick.split(", ")[1].split(" - ")[1]
                }
        
                fetch("/api/draft/pick", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(draftPickObject)
                })
                .then(function(response){ 
                    return response.json(); 
                })
                .then(function(res){
                    clearInterval(draftTimerIntervals[0])
                    draftTimerIntervals.length = 0;

                    startDraftTimer()
                    loadHtml(res, "block")
                });
            } else {
                alert("Player Not Available and/or Incorrect Input")
            }
        })
    } else if (e.target.classList.contains("submit-missed-player-pick")){
        let playerPickInput = e.target.parentElement.children[0];
        let playerPick = playerPickInput.value;

        availablePlayersToDraft().then((availablePlayersToDraft) => {
            const availablePlayersToDraftDetails = availablePlayersToDraft.map((ap) => ap.details)
            if(availablePlayersToDraftDetails.includes(playerPick)){
                const draftPickObject = {
                    round: playerPickInput.getAttribute("round"),
                    pick: playerPickInput.getAttribute("pick"),
                    name: playerPick.split(",")[0],
                    player_team: teamsMap[playerPick.split(", ")[1].split(" - ")[0]],
                    position: playerPick.split(", ")[1].split(" - ")[1],
                    draftPickDeadline: "6666-12-31 00:00:00"
                }
        
                fetch("/api/draft/pick", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(draftPickObject)
                })
                .then(function(response){ 
                    return response.json(); 
                })
                .then(function(res){
                    clearInterval(draftTimerIntervals[0])
                    draftTimerIntervals.length = 0;

                    startDraftTimer()
                    loadHtml(res, "block")
                });
            } else {
                alert("Player Not Available and/or Incorrect Input")
            }
        })
    } else if (e.target.id == "show-draft-button"){
        showCorrectSection("draft")
    } else if (e.target.id == "show-keepers-button"){
        showCorrectSection("keepers")
    } else if (e.target.id == "show-all-teams-button"){
        showCorrectSection("all-teams")
    } else if (e.target.id == "show-all-available-players-button"){
        showCorrectSection("all-available-players")
    } else if (e.target.id == "show-trades-button"){
        showCorrectSection("trades")
    } else if (e.target.id == "show-rosters-draft-picks-button"){
        showCorrectSection("rosters-draft-picks")
    } else if (e.target.classList.contains("keepers-checkbox")){
        fetch("/auth/signed-in")
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){ 
            fetch(`/api/keepers/${res.user.split(" ").join("&")}`)
            .then(function(response){ 
                return response.json(); 
            })
            .then(function(teamKeepers){
                if(teamKeepers.data.filter((tk) => tk.keeper == 1).length < 14 || !e.target.checked){
                    let player = teamKeepers.data.find((tk) => tk.name == e.target.value.split("&").join(" "));
                    let keeper = player.keeper == 0 ? true : false;
                    fetch(`/api/keepers/${res.user.split(" ").join("&")}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({keeper: keeper, name: player.name})
                    })
                    .then(function(response){ 
                        return response.json(); 
                    })
                    .then(function(res){ 
                    });
                } else {
                    e.target.checked = false;
                    alert("Can only have 14 Keepers")
                }
            });
        });
    } else if (e.target.id == "reset-draft-button"){
        fetch("/api/draft/reset", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){ 
            loadHtml(res, "block");
            window.location.reload();
        });
    } else if (e.target.id == "pause-draft-button"){
        let draft = await getDraft();
        document.getElementById("draft-controls-section").style.display = "none";
        const currentPick = draft.find((dp) => dp.name == null && !dp.draftPickDeadline.includes('6666'))
        fetch("/api/draft/pick", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({state: "paused", draftPickDeadline: '5555-12-31 00:00:00', round: currentPick.round, pick: currentPick.pick})
        })
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){
            // loadHtml(res, "block")
            document.getElementById("draft-timer").innerText = "Draft Pick Deadline: PENDING"
        });
    } else if (e.target.id == "continue-draft-button"){
        let draft = await getDraft();
        document.getElementById("draft-controls-section").style.display = "block";
        const currentPick = draft.find((dp) => dp.name == null && !dp.draftPickDeadline.includes('6666'))
        fetch("/api/draft/pick", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({state: "continued", draftPickDeadline: '5555-12-31 00:00:00', round: currentPick.round, pick: currentPick.pick})
        })
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){
            loadHtml(res, "block")
        });
    } else if (e.target.id == "start-draft-button"){
        let {user} = await getLoggedInUser();
        await getDraftTimer();
        startDraftTimer();
        loadHtml({success: true, user},"block")
    } else if (e.target.id == "set-timer-button"){
        const timerInputValue = document.getElementById("set-timer-input").value;
        fetch("/api/draft")
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){
            let draft = res.data;
            const currentPick = draft.find((dp) => dp.name == null && !dp.draftPickDeadline.includes('6666'))
            fetch("/api/draft/timer", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({timer: timerInputValue, pick: currentPick.pick, round: currentPick.round})
            })
            .then(function(response){ 
                return response.json(); 
            })
            .then(function(res){
                clearInterval(draftTimerIntervals[0])
                draftTimerIntervals.length = 0;
    
                startDraftTimer()
                loadHtml(res, "block")
            });
        })
    } else if (e.target.id == "propose-trade-button"){
        const tradeItems = document.getElementsByClassName("trade-items")
        const checkedItems = []
        for(let i = 0; i < tradeItems.length; i++){
            if(tradeItems[i].checked){
                checkedItems.push(tradeItems[i])
            }
        }
        const overallTrade = {initiator: {trading: []}, receiver: {trading: []}}
        checkedItems.forEach((ci) => {
            const team = ci.id.split("-")[0].split("&").join(" ");
            const tradeRole = ci.id.split("-")[1]

            overallTrade[tradeRole]['team'] = team
            overallTrade[tradeRole]['trading'].push(ci.value.split("+").join(" "))
        })

        fetch("/api/trade", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(overallTrade)
        })
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){ 
            document.getElementById("trade-sent-text").style.display = "block"
            setTimeout(() => {
                loadHtml(res, "block")
            }, 3000)
        });
    } else if (e.target.classList.contains("accept-trade-button") && e.target.classList.contains("commish-trade-button")){
        let {user} = await getLoggedInUser();
        fetch("/api/trade", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ID: e.target.value, action: "approved by commissioner", commissioner: user})
        })
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){ 
            loadHtml(res, "block");
        });
    } else if (e.target.classList.contains("reject-trade-button") && e.target.classList.contains("commish-trade-button")){
        let {user} = await getLoggedInUser();
        fetch("/api/trade", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ID: e.target.value, action: "rejected by commissioner"})
        })
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){ 
            loadHtml(res, "block");
        });
    } else if (e.target.classList.contains("accept-trade-button")){
        fetch("/api/trade", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ID: e.target.value, action: "accepted by receiver"})
        })
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){ 
            loadHtml(res, "block");
        });
    } else if (e.target.classList.contains("reject-trade-button")){
        fetch("/api/trade", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ID: e.target.value, action: "rejected by receiver"})
        })
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){ 
            loadHtml(res, "block");
        });
    }
})

document.getElementsByTagName("body")[0].addEventListener("change", async function(e){
    let availablePlayerSearchValue;
    if(document.getElementById("search-available-player") != null){
        availablePlayerSearchValue = document.getElementById("search-available-player").value;
    }
    if(e.target.id == "all-available-players-position-filter"){
        let teamDropdownValue = document.getElementById("all-available-players-team-filter").value

        let filteredPlayers = "";
        availablePlayersToDraft().then((availablePlayersToDraft) => {
            availablePlayersToDraft.forEach((player) => {
                let position = player.details.split(", ")[1].split(" - ")[1];
                if(e.target.value == "all positions"){
                    if(availablePlayerSearchValue == undefined && (teamDropdownValue == "" || teamDropdownValue == "all teams")){
                        filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                    } else if (availablePlayerSearchValue != undefined && (teamDropdownValue == "" || teamDropdownValue == "all teams")){
                        let playerName = player.details.split(", ")[0];
                        if(playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase())){
                            filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                        }
                    } else if (availablePlayerSearchValue != undefined && (teamDropdownValue != "" && teamDropdownValue != "all teams")){
                        let team = teamsMap[player.details.split(", ")[1].split(" - ")[0]]
                        let playerName = player.details.split(", ")[0];
                        if(playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase()) && team == teamDropdownValue){
                            filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                        }
                    } else if (availablePlayerSearchValue != undefined && teamDropdownValue == "all teams"){
                        if(playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase())){
                            filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                        }
                    }
                } else {
                    if(availablePlayerSearchValue == undefined && (teamDropdownValue == "" || teamDropdownValue == "all teams")){
                        if(position.includes(e.target.value)){
                            filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                        }
                    } else if (availablePlayerSearchValue == undefined && (teamDropdownValue != "" && teamDropdownValue != "all teams")){
                        let team = teamsMap[player.details.split(", ")[1].split(" - ")[0]]
                        if(position.includes(e.target.value) && team == teamDropdownValue){
                            filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                        }
                    } else if (availablePlayerSearchValue != undefined && (teamDropdownValue == "" || teamDropdownValue == "all teams")){
                        let playerName = player.details.split(", ")[0];
                        if(position.includes(e.target.value) && playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase())){
                            filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                        }  
                    } else {
                        let team = teamsMap[player.details.split(", ")[1].split(" - ")[0]]
                        let playerName = player.details.split(", ")[0];
                        if(position.includes(e.target.value) && playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase()) && team == teamDropdownValue){
                            filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                        }  
                    }
                }
            })
            document.getElementById("available-players-ul").innerHTML = filteredPlayers;
        })
    } else if (e.target.id == "all-available-players-team-filter"){
        let positionDropdownValue = document.getElementById("all-available-players-position-filter").value;

        let filteredPlayers = "";
        availablePlayersToDraft().then((availablePlayersToDraft) => {
            availablePlayersToDraft.forEach((player) => {
                let team = teamsMap[player.details.split(", ")[1].split(" - ")[0]];
                if(availablePlayerSearchValue == undefined && positionDropdownValue == ""){
                    if(e.target.value == "all teams"){
                        filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                    } else {
                        if(team == e.target.value){
                            filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                        }
                    }
                } else if (availablePlayerSearchValue == undefined && positionDropdownValue != ""){
                    let position = player.details.split(", ")[1].split(" - ")[1]
                    if(e.target.value == "all teams" && positionDropdownValue == "all teams"){
                        filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                    } else if (e.target.value != "all teams" && positionDropdownValue == "all teams"){
                        if(team == e.target.value){
                            filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                        }
                    } else if (e.target.value == "all teams" && positionDropdownValue != "all teams"){
                        if(position.includes(positionDropdownValue)){
                            filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                        }
                    } else {
                        if(team == e.target.value && position.includes(positionDropdownValue)){
                            filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                        }
                    }
                } else if (availablePlayerSearchValue != undefined && positionDropdownValue == ""){
                    let playerName = player.details.split(", ")[0];
                    if(e.target.value == "all teams"){
                        if(playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase())){
                            filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"  
                        }
                    } else {
                        if(team == e.target.value && playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase())){
                            filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                        }
                    }
                } else {
                    let playerName = player.details.split(", ")[0];
                    let position = player.details.split(", ")[1].split(" - ")[1];
                    if(e.target.value == "all teams" && positionDropdownValue == "all positions"){
                        if(playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase())){
                            filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                        }
                    } else if (e.target.value != "all teams" && positionDropdownValue == "all positions"){
                        if(team == e.target.value && playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase())){
                            filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                        }  
                    } else if (e.target.value == "all teams" && positionDropdownValue != "all positions"){
                        if(playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase()) && position.includes(positionDropdownValue)){
                            filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                        }  
                    } else {
                        if(team == e.target.value && playerName.toLowerCase().includes(availablePlayerSearchValue.toLowerCase()) && position.includes(positionDropdownValue)){
                            filteredPlayers += "<li class='available-players-li'><a href='"+player.url+"' target='_blank'>"+player.details+"</a></li>"
                        }
                    }
                }
            })
            document.getElementById("available-players-ul").innerHTML = filteredPlayers;
        })
    } else if (e.target.id == "confirm-reset-checkbox"){
        document.getElementById("reset-draft-button").disabled = !document.getElementById("reset-draft-button").disabled
    } else if (e.target.id == "team-to-trade-with"){
        const tradeReceiver = document.getElementById("team-to-trade-with").value.split("+").join(" ")
        const loggedInUser = await getLoggedInUser();
        const draft = await getDraft();
        const teamsPlayers = await getAllTeams();

        let tradeRostersDraftPicks = {};
        tradeRostersDraftPicks[loggedInUser.user] = {role: "initiator", draft: draft.filter((dp) => dp.team == loggedInUser.user), players: teamsPlayers.filter((tp) => tp.team == loggedInUser.user)}
        tradeRostersDraftPicks[tradeReceiver] = {role: "receiver", draft: draft.filter((dp) => dp.team == tradeReceiver), players: teamsPlayers.filter((tp) => tp.team == tradeReceiver)}
        
        let makeTradeHtml = "<div id='trade-wells' style='display: flex;'>";
        for(i in tradeRostersDraftPicks){
            makeTradeHtml += `<div class='well teams-players-well' id="${i.split(" ").join("&")}-well-2" style='width: 300px; margin: 3px;'><h1>${i}</h1><ul id="${i.split(" ").join("&")}-team-list" style='list-style-type: none;'>`
            makeTradeHtml += "<h2>Players</h2>";
            makeTradeHtml += "<ul style='list-style-type: none;'>"
            tradeRostersDraftPicks[i].players.forEach((p) => {
                makeTradeHtml += "<li><input id=\""+i.split(" ").join("&")+"-"+tradeRostersDraftPicks[i].role+"-trade-items\" class='trade-items' value=\""+p.name.split(" ").join("+")+"\" type='checkbox'/>" + p.name + "</li>"
            })
            makeTradeHtml += "</ul>"
            makeTradeHtml += "<h2>Draft</h2>";
            makeTradeHtml += "<h3>Picks</h3>";
            makeTradeHtml += "<ul style='list-style-type: none;'>"
            tradeRostersDraftPicks[i].draft.filter((p) => p.name == null).forEach((dp) => {
                makeTradeHtml += "<li><input id=\""+i.split(" ").join("&")+"-"+tradeRostersDraftPicks[i].role+"-trade-items\" class='trade-items' value='Round:"+dp.round+"+Pick:"+dp.pick+"' type='checkbox'/>Round: " + dp.round + ", Pick: " + dp.pick + "</li>"
            })
            makeTradeHtml += "</ul>"
            makeTradeHtml += "</div>";
        }
        makeTradeHtml += "</div>"
        makeTradeHtml += "<br><button id='propose-trade-button' style='font-size: 25px; width: 200px;'>Propose Trade</button><h2 id='trade-sent-text' style='display:none;'>Trade Sent</h2>"
        document.getElementById("make-trade-div").innerHTML = makeTradeHtml
    }
});