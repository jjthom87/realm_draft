function getDraft(){
    return fetch("/api/draft")
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){
            return res.data;
        })
}

function getKeepers(team){
    let api = team != null ? `/api/keepers/${team}` : '/api/keepers'
    return fetch(api)
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){
            return res.data;
        })
}

function getAllTeams(team){
    let api = team != null ? `/api/teams/${team}` : '/api/teams'
    return fetch(api)
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(res){
            return res.data;
        })
}

let teamsMap = {
    "New York Yankees": "NYY",
    "New York Mets": "NYM",
    "Chicago Cubs": "CHC",
    "Arizona Diamondback": "AZ",
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
    "AZ": "Arizona Diamondback",
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

function allAvailablePlayersToDraft(){
    return fetch("/api/players")
    .then(function(response){ 
        return response.json(); 
    })
    .then(function(allPlayers){
        return fetch("/api/draft/players")
        .then(function(response){ 
            return response.json(); 
        })
        .then(function(draftPicks){
            return fetch("/api/keepers")
            .then(function(response){ 
                return response.json(); 
            })
            .then(function(keepers){
                let players = allPlayers.data;
                let mappedPlayers = players.map((player)=> { 
                    return player.name + ", " + teamsMap[player.team] + " - " + player.position
                })
                mappedPlayers.forEach((player, index) => {
                    if(draftPicks.data.includes(player.split(",")[0])){
                        mappedPlayers.splice(index,1)
                    }
                    let mappedKeepers = keepers.data.map((keeper) => keeper.name);
                    if(mappedKeepers.includes(player.split(",")[0])){
                        mappedPlayers.splice(index,1)
                    }
                });
                return mappedPlayers;
            });
        });
    });
}

async function availablePlayersToDraft(){
    return await allAvailablePlayersToDraft();
}

async function loadHtml(res, draftDisplay){
    if(res.success){
        let user = res.user
        document.getElementById("page-container").innerHTML = "";
        let html = "";

        let welcomeHtml = "<h3>Welcome " + res.user + "</h3>";

        let buttonsHtml = '<div><button style="margin: 2px;" id="show-draft-button">Draft</button><button style="margin: 2px;" id="show-keepers-button">Keepers</button><button style="margin: 2px;" id="show-all-teams-button">Teams</button></div>'

        let draftHtml = '<div id="draft-section" style="display: '+draftDisplay+';">'

        let currentPickHtml = "";
        let draft = await getDraft()
        let currentDraftPick = draft.find((dp) => dp.name == null)
        currentPickHtml += `<a href=#current-pick>Current Pick: Round ${currentDraftPick.round}, Pick: ${currentDraftPick.pick}</a>`

        draftHtml += currentPickHtml;
        draftHtml += "<button style='background-color: red; color: white; float: right;' id='reset-draft-button'>Reset Draft</button>"
        draftHtml += "<table>";
        draftHtml += '<thead><tr><th scope="col">Round</th><th scope="col">Pick</th><th scope="col">Team</th><th scope="col">Player</th><th scope="col">Team</th><th scope="col">Position</th></tr></thead>';

        let draftTable = ""
        let current = draft.find((dp) => dp.name == null)
        draft.forEach((dp) => {
            let userHtml = dp.team == user ? 'style="color: red"' : ''

            if(dp.name == null){
                if(dp.round == current.round && dp.pick == current.pick){
                    // if(dp.team == user){
                            draftTable += `<tr style='background-color: #add898; font-weight: bold;' id='current-pick'><th scope="row">${dp.round}</th><td>${dp.pick}</td><td ${userHtml}>${dp.team}</td><td><input round=${dp.round} pick=${dp.pick} id='player-pick-input'/><button id='submit-player-pick' style='border: 2px solid black;'>Submit Pick</button></td><td>PENDING</td><td>PENDING</td></tr>`
                    // } else {
                    //     draftTable += `<tr style='background-color: #add898;' id='current-pick'><th scope="row">${dp.round}</th><td>${dp.pick}</td><td ${userHtml}>${dp.team}</td><td style="color: #27477f">CURRENT PICK</td><td>PENDING</td></tr>`   
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

        let allTeamsSectionHtml = "<div id='all-teams-section' style='display: none;'><br><input id='search-team-player' placeholder='Search Player or Team Name' style='width: 200px; display: block; margin: 0 auto;'/><br><br><div id='all-teams-div' style='display: ruby;'>";
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
                    allTeamsSectionHtml += "<li class='team-player-li' style='text-decoration: line-through; color: red;'>"+player+"</li>"
                } else {
                    allTeamsSectionHtml += "<li class='team-player-li'>"+player+"</li>"
                }
            })
            allTeamsSectionHtml += "</ul></div>"
        })
        allTeamsSectionHtml += "</div></div>"

        html += welcomeHtml
        html += buttonsHtml
        html += draftHtml
        html += keepersHtml
        html += allTeamsSectionHtml

        document.getElementById("page-container").innerHTML = html;
    } else {
        document.getElementById("page-container").innerHTML = "";
        let html = ""
        let signInHtml = '<h3>Sign In</h3><div class="well"><form id="sign-in-form"><label>Username</label><br><input type="text" id="username-input"/><br><label>Password</label><br><input type="password" id="password-input"/><br><br><input class="btn btn-danger" id="sign-in-form-submit" type="submit"></form></div>'
        html += signInHtml
        document.getElementById("page-container").innerHTML = html;
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
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
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

let playerSearchValue = "";
const teamsPlayersHtml = []
let keydownOnce = false;
document.getElementsByTagName("body")[0].addEventListener("keydown", function(e){
    if(e.target.id == "player-pick-input"){
        availablePlayersToDraft().then((availablePlayersToDraft) => {
            autocomplete(document.getElementById("player-pick-input"), availablePlayersToDraft)
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
    }
})

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
            if(availablePlayersToDraft.includes(playerPick)){
                const draftPickObject = {
                    round: playerPickInput.getAttribute("round"),
                    pick: playerPickInput.getAttribute("pick"),
                    name: playerPick.split(",")[0],
                    player_team: teamsMap[playerPick.split(", ")[1].split(" - ")[0]],
                    position: playerPick.split(",")[1].split(" - ")[1]
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
                    loadHtml(res, "block")
                });
            } else {
                alert("Player Not Available and/or Incorrect Input")
            }
        })
    } else if (e.target.id == "show-draft-button"){
        document.getElementById("keepers-section").style.display = "none";
        document.getElementById("all-teams-section").style.display = "none"
        document.getElementById("draft-section").style.display = document.getElementById("draft-section").style.display == "none" ? "block" : "none"
        document.getElementById("show-draft-button").style.color = document.getElementById("draft-section").style.display == "none" ? "black" : "red"
        document.getElementById("show-keepers-button").style.color = "black";
        document.getElementById("show-all-teams-button").style.color = "black";
    } else if (e.target.id == "show-keepers-button"){
        document.getElementById("draft-section").style.display = "none";
        document.getElementById("all-teams-section").style.display = "none"
        document.getElementById("keepers-section").style.display = document.getElementById("keepers-section").style.display == "none" ? "block" : "none";
        document.getElementById("show-keepers-button").style.color = document.getElementById("keepers-section").style.display == "none" ? "black" : "red";
        document.getElementById("show-draft-button").style.color = "black";
        document.getElementById("show-all-teams-button").style.color = "black";
    } else if (e.target.id == "show-all-teams-button"){
        document.getElementById("draft-section").style.display = "none";
        document.getElementById("keepers-section").style.display = "none"
        document.getElementById("all-teams-section").style.display = document.getElementById("all-teams-section").style.display == "none" ? "inline" : "none";
        document.getElementById("show-all-teams-button").style.color = document.getElementById("all-teams-section").style.display == "none" ? "black" : "red";
        document.getElementById("show-draft-button").style.color = "black";
        document.getElementById("show-keepers-button").style.color = "black";
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
    }
})