const knex = require('knex')(require('../knexfile.js'));

function sortDraftArray(draftArray){
    let finalDraftArray = [];
    let round = 1;
    let finalRound = 16;
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
    let preSortedDraft = []
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
            while(round <= 16){
                preSortedDraft.push({team, round, pick})
                round++;
            }
            pick++;
            round = 1;
        });

        let sortedDraft = sortDraftArray(preSortedDraft);
        knex.batchInsert("draft", sortedDraft)
        .then(res => {
            console.log(res)
        })
        .catch(err => {
            console.log('Error here', err);
        });
    
    });
};

createDraftInDb()