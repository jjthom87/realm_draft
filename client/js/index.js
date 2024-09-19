const allAvailablePlayersToDraftArray = [];
const draftTimerIntervals = [];

let playerSearchValue = "";
let availablePlayerSearchValue = "";
const teamsPlayersHtml = []
let keydownOnce = false;

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
    "Oakland Athletics": "OAK",
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
    "OAK": "Oakland Athletics",
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
                let draft = await getDraftTimer();
                if(draft.data.timer > 0){
                    document.getElementById("draft-timer").innerText = "Timer: " + draft.data.timer
                } else {
                    loadHtml(draft, "block")
                }
            }
        },1000)
        draftTimerIntervals.push(draftInterval)
    }, 500)
}
startDraftTimer()

async function loadHtml(res, draftDisplay){
    if(res.success){
        let user = res.user

        document.getElementById("page-container").innerHTML = "";
        let html = "";

        let welcomeHtml = "<h3>Welcome " + res.user + "</h3>";

        let buttonsHtml = '<div><button style="margin: 2px;" id="show-draft-button">Draft</button><button style="margin: 2px;" id="show-keepers-button">Keepers</button><button style="margin: 2px;" id="show-all-teams-button">Teams</button><button style="margin: 2px;" id="show-all-available-players-button">Available Players</button></div>'

        let draftHtml = '<div id="draft-section" style="display: '+draftDisplay+';">'

        let draft = await getDraft()
        let lastPick = draft.filter((dp) => dp.name != null).pop();
        if(lastPick == undefined){
            lastPick = draft[0]
        } else {
            let lastPickHtml = `<p>Round ${lastPick.round} Pick ${lastPick.pick}, ${lastPick.team} selects <span style="color: orange;">${lastPick.name} (${lastPick.position})</span> from the ${lastPick.player_team}</p>`
            draftHtml += lastPickHtml;
        }

        let currentDraftPick = draft.find((dp) => dp.name == null && dp.timer != 666666);

        let draftTimer = await getDraftTimer();
        let draftTimerHtml = `<p id='draft-timer'>Timer: ${draftTimer.timer}</p>`
        draftHtml += draftTimerHtml;

        let currentPickHtml = `<a href=#current-pick>Current Pick - Team: ${currentDraftPick.team}, Round: ${currentDraftPick.round}, Pick: ${currentDraftPick.pick}</a>`

        draftHtml += currentPickHtml;
        draftHtml += "<button style='background-color: red; color: white; float: right;' id='reset-draft-button'>Reset Draft</button>"
        draftHtml += `<p><div style='float: right;'><input placeholder='Set Seconds' style='width: 100px;' id='set-timer-input'/><button id='set-timer-button'>Set Timer</button></div></p>`
        draftHtml += "<table>";
        draftHtml += '<thead><tr><th scope="col">Round</th><th scope="col">Pick</th><th scope="col">Team</th><th scope="col">Player</th><th scope="col">Team</th><th scope="col">Position</th></tr></thead>';

        let draftTable = ""
        let current = draft.find((dp) => dp.name == null && dp.timer != 666666);
        draft.forEach((dp) => {
            let userHtml = dp.team == user ? 'style="color: red"' : ''

            if(dp.name == null){
                if(dp.round == current.round && dp.pick == current.pick){
                    // if(dp.team == user){
                            draftTable += `<tr style='background-color: #add898; font-weight: bold;' id='current-pick'><th scope="row">${dp.round}</th><td>${dp.pick}</td><td ${userHtml}>${dp.team}</td><td><input round=${dp.round} pick=${dp.pick} id='player-pick-input'/><button id='submit-player-pick' style='border: 2px solid black;'>Submit Pick</button></td><td>PENDING</td><td>PENDING</td></tr>`
                    // } else {
                    //     draftTable += `<tr style='background-color: #add898;' id='current-pick'><th scope="row">${dp.round}</th><td>${dp.pick}</td><td ${userHtml}>${dp.team}</td><td style="color: #27477f">CURRENT PICK</td><td>PENDING</td></tr>`   
                    // }
                } else if (dp.timer == 666666){
                    // if(dp.team == user){
                        draftTable += `<tr style='background-color: #FF7F7F; font-weight: bold;'><th scope="row">${dp.round}</th><td>${dp.pick}</td><td ${userHtml}>${dp.team}</td><td><input round=${dp.round} pick=${dp.pick} class='missed-player-pick-input'/><button class='submit-missed-player-pick' style='border: 2px solid black;'>Submit Pick</button></td><td>PENDING</td><td>PENDING</td></tr>`
                    // } else {
                    //     draftTable += `<tr style='background-color: #FF7F7F;'><th scope="row">${dp.round}</th><td>${dp.pick}</td><td ${userHtml}>${dp.team}</td><td>MISSED PICK</td><td>PENDING</td></tr>`   
                    // }
                } else {
                    draftTable += `<tr><th scope="row">${dp.round}</th><td>${dp.pick}</td><td ${userHtml}>${dp.team}</td><td>PENDING</td><td>PENDING</td><td>PENDING</td></tr>`
                }
            } else {
                draftTable += `<tr><th scope="row">${dp.round}</th><td>${dp.pick}</td><td ${userHtml}>${dp.team}</td><td>${dp.name}</td><td>${dp.player_team}</td><td>${dp.position}</td></tr>`
            }
        });
        draftHtml += draftTable
        draftHtml += '</table></div>'

        let keepersHtml = "<div id='keepers-section' style='display: none; margin-left: -38px;'><ul style='list-style-type: none;'>"
        let teamKeepers = await getKeepers(user.split("&").join(""))
        teamKeepers.forEach((tk) => {
            keepersHtml += `<li><input class="keepers-checkbox" type="checkbox" ${tk.keeper == 1 ? 'checked' : ''} value=${tk.name.split(" ").join("&")} /> ${tk.name}, ${teamsMap[tk.player_team]} - ${tk.position}</li>`
        })
        keepersHtml += "</ul></div>"

        let allTeamsSectionHtml = "<div id='all-teams-section' style='display: none;'><br><input id='search-team-player' placeholder='Search Player or Team Name' style='width: 200px; display: block; margin: 0 auto;'/><h4 style='color: red; text-align: center;'>*keeper</h4><br><div id='all-teams-div' style='display: flex; flex-flow: wrap;'>";
        let teams = await getAllTeams();
        let allKeepers = await getKeepers();
        let teamNames = new Set(teams.map((team) => team.team))
        let allTeamsMap = {};
        teams.forEach((team) => {
            if(allTeamsMap[team.team] == null){
                allTeamsMap[team.team] = [];
            }
            allTeamsMap[team.team].push(team.name)
        })
        teamNames.forEach((teamName) => {
            allTeamsSectionHtml += `<div class='well teams-players-well' id="${teamName.split(" ").join("&")}-well" style='width: 300px; margin: 3px;'><h3>${teamName}</h3><ul id="${teamName.split(" ").join("&")}-team-list" style='list-style-type: none;'>`
            allTeamsMap[teamName].forEach((player) => {
                if(allKeepers.map((k) => k.name).includes(player)){
                    allTeamsSectionHtml += "<li class='team-player-li' style='color: red;'>"+player+"</li>"
                } else {
                    allTeamsSectionHtml += "<li class='team-player-li'>"+player+"</li>"
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
                allAvailablePlayersToDraftArray.push(availablePlayerToDraft)
            })

            allAvailablePlayersHtml += "</ul></div>"

            html += welcomeHtml
            html += buttonsHtml
            html += draftHtml
            html += keepersHtml
            html += allTeamsSectionHtml
            html += allAvailablePlayersHtml

            document.getElementById("page-container").innerHTML = html;
        })
    } else {
        document.getElementById("page-container").innerHTML = "";
        let html = ""
        let signInHtml = '<h3>Sign In</h3><div class="well"><form id="sign-in-form"><label>Username</label><br><input type="text" id="username-input"/><br><label>Password</label><br><input type="password" id="password-input"/><br><br><input class="btn btn-danger" id="sign-in-form-submit" type="submit"></form></div>'
        html += signInHtml
        document.getElementById("page-container").innerHTML = html;
    }
}

function showCorrectSection(inputSection){
    const sections = ["keepers", "all-teams", "all-available-players", "draft"];
    sections.forEach((section)=>{
        if(section != inputSection){
            document.getElementById(section+"-section").style.display = "none";
            document.getElementById("show-"+section+"-button").style.color = "black";
        }
    })
    document.getElementById(inputSection+"-section").style.display = document.getElementById(inputSection+"-section").style.display == "none" ? "block" : "none"
    document.getElementById("show-"+inputSection+"-button").style.color = document.getElementById(inputSection+"-section").style.display == "none" ? "black" : "red"
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
            if(teamsPlayersHtml[i].toLowerCase().includes('<li class="team-player-li">') && teamsPlayersHtml[i].toLowerCase().includes(playerSearchValue.toLowerCase())){
                const parser = new DOMParser();
                const doc = parser.parseFromString(teamsPlayersHtml[i], "application/xml");
                const playerListItems = doc.children[0].children[1].children
                for(let j = 0; j < playerListItems.length; j++){
                    if(playerListItems[j].innerHTML.toLowerCase().includes("á")){
                        playerListItems[j].innerHTML = playerListItems[j].innerHTML.replaceAll("á", "a")
                    } else if (playerListItems[j].innerHTML.toLowerCase().includes("é")){
                        playerListItems[j].innerHTML = playerListItems[j].innerHTML.replaceAll("é", "e")
                    } else if (playerListItems[j].innerHTML.toLowerCase().includes("ó")){
                        playerListItems[j].innerHTML = playerListItems[j].innerHTML.replaceAll("ó", "o")
                    } else if (playerListItems[j].innerHTML.toLowerCase().includes("í")){
                        playerListItems[j].innerHTML = playerListItems[j].innerHTML.replaceAll("í", "i")
                    }
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
    } else if (e.target.id == "search-available-player"){
        let positionDropdownValue = document.getElementById("all-available-players-position-filter").value;
        let teamDropdownValue = document.getElementById("all-available-players-team-filter").value;

        if(e.key == "Backspace"){
            availablePlayerSearchValue = availablePlayerSearchValue.substring(0, availablePlayerSearchValue.length - 1)
        } else {
            availablePlayerSearchValue += e.key
        }

        let filteredPlayers = ""
        for(let i = 0; i < allAvailablePlayersToDraftArray.length; i++){
            const playerDetails = allAvailablePlayersToDraftArray[i].details;
            const playerUrl = allAvailablePlayersToDraftArray[i].url;
            let playerName = playerDetails.split(", ")[0];
            if(playerName.includes("á")){
                playerName = playerName.replaceAll("á", "a")
            } else if (playerName.includes("é")){
                playerName = playerName.replaceAll("é", "e")
            } else if (playerName.includes("ó")){
                playerName = playerName.replaceAll("ó", "o")
            } else if (playerName.includes("í")){
                playerName = playerName.replaceAll("í", "i")
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
        }

        document.getElementById("available-players-ul").innerHTML = filteredPlayers;
    }
});

function showCorrectSection(inputSection){
    const sections = ["keepers", "all-teams", "all-available-players", "draft"];
    sections.forEach((section)=>{
        if(section == inputSection){
            document.getElementById(section + "-section").style.display = document.getElementById(section+"-section").style.display == "none" ? "block" : "none"
            document.getElementById("show-"+section+"-button").style.color = document.getElementById(section+"-section").style.display == "none" ? "black" : "red"
        } else {
            document.getElementById(section+"-section").style.display = "none";
            document.getElementById("show-"+section+"-button").style.color = "black";
        }
    })
}

document.getElementsByTagName("body")[0].addEventListener("click", function(e){
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
    } else if (e.target.id == "show-draft-button"){
        showCorrectSection("draft")
    } else if (e.target.id == "show-keepers-button"){
        showCorrectSection("keepers")
    } else if (e.target.id == "show-all-teams-button"){
        showCorrectSection("all-teams")
    } else if (e.target.id == "show-all-available-players-button"){
        showCorrectSection("all-available-players")
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
        let resetDraftDecision = prompt("Confirming that you want to reset the draft. Type 'y' if you want to.");
        if(resetDraftDecision == "y"){
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
                loadHtml(res, "block")
            });
        }
    } else if (e.target.id == "set-timer-button"){
        const timerInputValue = document.getElementById("set-timer-input").value;
        fetch("/api/draft")
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){
            let draft = res.data;
            const currentPick = draft.find((dp) => dp.name == null && dp.timer != 666666)
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
    }
})

document.getElementsByTagName("body")[0].addEventListener("change", function(e){
    let availablePlayerSearchValue;
    if(document.getElementById("search-available-player") != null){
        availablePlayerSearchValue = document.getElementById("search-available-player").value;
    }
    if(e.target.id == "all-available-players-position-filter"){
        let teamDropdownValue = document.getElementById("all-available-players-team-filter").value

        let filteredPlayers = "";
        allAvailablePlayersToDraftArray.forEach((player) => {
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
    } else if (e.target.id == "all-available-players-team-filter"){
        let positionDropdownValue = document.getElementById("all-available-players-position-filter").value;

        let filteredPlayers = "";
        allAvailablePlayersToDraftArray.forEach((player) => {
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
    }
});