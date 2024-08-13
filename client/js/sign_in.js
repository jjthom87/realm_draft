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
                }
            });
        
        })  
    }
})