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
//createDraftInDb()

function setDraftTimer(currentDraftPickTimer){    
    if(currentDraftPickTimer == 0){
        const date = new Date();
        const dayOfWeek = date.getDay();
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = weekdays[dayOfWeek];
        
        let seconds;
        if(dayName == "Sunday" || dayName == "Saturday"){
            seconds = 10800
        } else {
            seconds = 21600
        }

        return seconds;

    } else {
        return currentDraftPickTimer;
    }
}

async function getCurrentPick(){
    return knex('draft')
            .select("*")
            .then(data => { 
                const currentPick = data.find((dp) => dp.name == null && dp.timer != 666666)
                return currentPick;
            })
            .catch(err => {
                return err;
            });
}

function runDraftTimer(){
    setInterval(async () => {
        const currentDraftPick = await getCurrentPick();
        let draftTimer = setDraftTimer(currentDraftPick.timer);
        draftTimer--;
        if(draftTimer > 0){
            knex('draft').where({ round: currentDraftPick.round, pick: currentDraftPick.pick }).update(
                {
                  timer: draftTimer,
                }
            ).then(data => {
            })
            .catch(err => {
                console.error('Error ', err);
            });
        } else {
            knex('draft').where({ round: currentDraftPick.round, pick: currentDraftPick.pick }).update(
                {
                  timer: 666666,
                }
            ).then(data => {
            })
            .catch(err => {
                console.error('Error ', err);
            });
        }
    },1000);
}

module.exports = { getCurrentPick, runDraftTimer };