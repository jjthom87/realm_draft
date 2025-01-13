const knex = require('knex')(require('../knexfile.js'));
const nodemailer = require("nodemailer");
const schedule = require('node-schedule');

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

async function sendEmailToNextPick(nextPick){
    const users = await getUsers();
    const nextPickUserEmail = users.find((user) => user.username == nextPick.team).email;

    const transporter = nodemailer.createTransport({
        host: "froofydoog.com",
        port: 465,
        secure: true, // true for port 465, false for other ports
        auth: {
          user: "draft-admin@froofydoog.com",
          pass: "",
        },
    });
    
    console.log(nextPickUserEmail)
    const messageToClient = await transporter.sendMail({
        from: '"Draft Admin" <draft-admin@froofydoog.com>', // sender address
        to: "draft-admin@froofydoog.com",//nextPickUserEmail, // list of receivers
        subject: "Local - You're the next pick. Round: " + nextPick.round + ", Pick: " + nextPick.pick, // Subject line
        html: "<div><a href='http://localhost:5050/#current-pick'>Go to draft</a><b>Good Luck!</b></div>", // html body
    });

    const messageToServer = await transporter.sendMail({
        from: '"Draft Admin" <draft-admin@froofydoog.com>', // sender address
        to: "draft-admin@froofydoog.com", // list of receivers
        subject: "Local - Draft Pick Made", // Subject line
        text: JSON.stringify(nextPick), // plain text body
    });

    console.log("Message sent to client: %s", messageToClient.messageId);
    console.log("Message sent to server: %s", messageToServer.messageId);
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
        const draft = await getDraft();
        let draftHasNotStarted = draft.every(d => d.draftPickDeadline.toString().includes('9999'));
        let draftHasPaused = draft.some(d => d.draftPickDeadline.toString().includes('5555'));
        if(draftHasNotStarted || draftHasPaused){
            const currentDraftPick = await getCurrentPick();
            let draftPickDeadline = setDraftPickDeadline(currentDraftPick.draftPickDeadline);
            if(new Date(draftPickDeadline.toString()) < new Date()){
                sendEmailToNextPick(currentDraftPick);
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
        }
    });
}
runDraftTimer();

module.exports = { getCurrentPick, runDraftTimer, setDraftPickDeadline, getDraft, sendEmailToNextPick };