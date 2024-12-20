const knex = require('knex')(require('../knexfile.js'));
const schedule = require('node-schedule');

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
// createDraftInDb()

function setDraftPickDeadline(currentDraftPickDeadline = null){  
    if(!currentDraftPickDeadline || currentDraftPickDeadline.toString().includes('9999')){
        const date = new Date();
        const dayOfWeek = date.getDay();
        const hourOfDay = date.getHours();
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = weekdays[dayOfWeek];
        let currentDate = new Date();
        
        const nightTimeDraftPeriod = [23,24,1,2,3,4,5,6,7]
        const weekDayTimeDraftPeriod = [8,9,10,11,12,13,14,15,16]
        const weekendDayTimeDraftPeriod = [8,9,10,11,12,13,14,15,16,17]
        
        if(dayName == "Sunday" || dayName == "Saturday"){
            if(nightTimeDraftPeriod.includes(hourOfDay)){
                currentDate.setHours(currentDate.getHours() + 9);
            } else if (weekendDayTimeDraftPeriod.includes(hourOfDay)){
                currentDate.setHours(currentDate.getHours() + 3);
            } else {
                currentDate.setHours(currentDate.getHours() + 2);
            }
        } else {
            if(nightTimeDraftPeriod.includes(hourOfDay)){
                currentDate.setHours(currentDate.getHours() + 8);
            } else if (weekDayTimeDraftPeriod.includes(hourOfDay)){
                currentDate.setHours(currentDate.getHours() + 5);
            } else {
                currentDate.setHours(currentDate.getHours() + 2);
            }
        }
        return currentDate;

    } else {
        return currentDraftPickDeadline;
    }
}


async function getCurrentPick(){
    return knex('draft')
            .select("*")
            .then(data => { 
                const currentPick = data.find((dp) => dp.name == null && !dp.draftPickDeadline.toString().includes('6666'))
                if(currentPick.draftPickDeadline.toString().includes('9999')){
                    const draftPickDeadline = setDraftPickDeadline(currentPick.draftPickDeadline.toString())
                    knex('draft').where({ round: currentPick.round, pick: currentPick.pick }).update(
                        {
                            draftPickDeadline: draftPickDeadline
                        }
                    ).then(data => {
                    })
                    .catch(err => {
                        console.error('Error ', err);
                    });
                    currentPick.draftPickDeadline = draftPickDeadline.toString();
                } else {
                    currentPick.draftPickDeadline = currentPick.draftPickDeadline.toString();
                }
                return currentPick;
            })
            .catch(err => {
                return err;
            });
}

async function runDraftTimer() {
    schedule.scheduleJob('*/1 * * * *', async function(){
        const currentDraftPick = await getCurrentPick();
        let draftPickDeadline = setDraftPickDeadline(currentDraftPick.draftPickDeadline);
        if(new Date(draftPickDeadline.toString()) < new Date()){
            knex('draft').where({ round: currentDraftPick.round, pick: currentDraftPick.pick }).update(
                {
                    draftPickDeadline: '6666-12-31 00:00:00',
                }
            ).then(data => {
            })
            .catch(err => {
                console.error('Error ', err);
            });
        }
    });
}
runDraftTimer();

const getDraft = async () => {
    return knex('draft')
    .then(data => {
        return data;
    })
    .catch(err => {
        return err;
    });
}

const getUsers = async () => {
    return knex('users')
    .then(data => {
        return data;
    })
    .catch(err => {
        return err;
    });
}

module.exports = { getCurrentPick, runDraftTimer, setDraftPickDeadline, getDraft, getUsers };