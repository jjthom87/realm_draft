const knex = require('knex')(require('../knexfile.js'));

function sortDraftArray(draftArray){
    let finalDraftArray = [];
    let round = 1;
    let finalRound = 18;
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
    
function createDraftInDb(){
    let round = 1;
    let pick = 1;
    knex('teams_players')
    .select("*")
    .then(tsps => {
        let teams = [];
        tsps.forEach((tp) => {
            if(!teams.includes(tp.team)){
                teams.push(tp.team)
            }
        })
    
        teams.forEach((team) => {
            while(round <= 18){
                knex('draft')
                .insert({
                    team: team,
                    round: round,
                    pick: pick
                })
                .then(res => {
                    console.log(res)
                })
                .catch(err => {
                  console.log('Error here', err);
                });
                round++;
            }
            pick++;
            round = 1;
        });
    
    });
}

function sortDraftInDb(){
    knex('draft')
    .select("*")
    .then(draft => {
        let sortedDraft = sortDraftArray(draft);
    
        sortedDraft.forEach((sd) => {
            knex('sorted_draft')
            .insert({
                team: sd.team,
                round: sd.round,
                pick: sd.pick
            })
            .then(res => {
                console.log(res)
            })
            .catch(err => {
              console.log('Error here', err);
            });
        })
    })
}