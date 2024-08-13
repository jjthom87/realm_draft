function sortDraftArray(draftArray){
    let finalDraftArray = [];
    let round = 1;
    let finalRound = 14;
    while(round <= finalRound){
        draftArray.forEach((dp) => {
            if(dp.round == round){
                finalDraftArray.push(dp)
            }
        })
        round++;
    }
    return finalDraftArray
}

setTimeout(() => {
    fetch("/auth/signed-in")
    .then(function(response){ 
        return response.json(); 
    })
    .then(function(res){ 
        if(res.success){
            document.getElementById("page-container").innerHTML = "";
            let html = "";
    
            let welcomeHtml = "<h2>Welcome " + res.user + "</h2>";
    
            let draftHtml = '<div id="draft-section">'
            draftHtml += "<table>"
            draftHtml += '<thead><tr><th scope="col">Round</th><th scope="col">Pick</th><th scope="col">Team</th><th scope="col">Player</th><th scope="col">Position</th></tr></thead>';
            
            fetch("/api/draft")
            .then(function(response){ 
                return response.json(); 
            })
            .then(function(res){
                let draftArray = sortDraftArray(res.data);
                let draftTable = ""
                draftArray.forEach((dp) => {
                    draftTable += `<tr><th scope="row">${dp.round}</th><td>${dp.pick}</td><td>${dp.team}</td><td>Pending</td><td>Pending</td></tr>`
                });
    
                draftHtml += draftTable
                draftHtml += '</table></div>'
        
                html += welcomeHtml
                html += draftHtml
        
                document.getElementById("page-container").innerHTML = html;
            });
        } else {
            document.getElementById("page-container").innerHTML = "";
            let html = ""
            let signInHtml = '<h3>Sign In</h3><div class="well"><form id="sign-in-form"><label>Username</label><br><input type="text" id="username-input"/><br><label>Password</label><br><input type="password" id="password-input"/><br><br><input class="btn btn-danger" id="sign-in-form-submit" type="submit"></form></div>'
            html += signInHtml
            document.getElementById("page-container").innerHTML = html;
        }
    });
}, 100)