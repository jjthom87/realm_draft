const express = require('express');
const nodemailer = require("nodemailer");
const router = express.Router();
const knex = require('knex')(require('../knexfile.js'));
const { getCurrentPick, setDraftPickDeadline, getDraft, sendEmailToNextPick, sendEmail } = require('../api/draft.js');

router.get('/draft', async (req, res) => {
    const draft = await getDraft();
    res.status(200).json({ success: true, data: draft });
});

router.get('/draft/players', (req, res) => {
    knex('draft')
    .select("name")
    .then(data => {
        res.status(200).json({ success: true, data: data.filter((d) => d.name != null).map((d) => d.name) });
    })
    .catch(err => {
        console.error('Error ', err);
    });
});

router.put('/draft/pick', async (req, res) => {
    let draftPickObject;
    if(req.body.draftPickDeadline && (req.body.draftPickDeadline.toString().includes('6666') || req.body.draftPickDeadline.toString().includes('5555')) && req.body.name == null){
        draftPickObject = 
        {
            draftPickDeadline: req.body.draftPickDeadline
        }
    } else {
        draftPickObject = 
        {
            name: req.body.name,
            position: req.body.position,
            player_team: req.body.player_team,
            draftPickMade: new Date()
        }
    }

    if(req.body.round && req.body.pick){
        knex('draft').where({ round: req.body.round, pick: req.body.pick }).update(draftPickObject)
        .then(async(data) => {
            let nextPick;
            let round;
            let nextPickDeadline;
            const draft = await getDraft();
            if(req.body.draftPickDeadline && req.body.draftPickDeadline.includes("6666")){
                const next = draft.find((dp) => dp.name == null && !dp.draftPickDeadline.toString().includes("6666"));
                if(next){
                    if(req.body.name == null){
                        sendEmailToNextPick(next);
                    }

                    nextPick = next.pick;
                    round = next.round;
                    nextPickDeadline = next.draftPickDeadline
                    res.status(200).json({ success: true, data: data, user: req.user.username, currentDraftPick: {pick: nextPick, round: round, draftPickDeadline: nextPickDeadline} });
                } else {
                    res.status(200).json({ success: true, data: data, user: req.user.username });
                }
            } else if (req.body.draftPickDeadline && req.body.draftPickDeadline.includes("5555")){
                let draftPickDeadline = req.body.state == "paused" ? '5555-12-31 00:00:00' : setDraftPickDeadline()
                knex('draft').where({ round: req.body.round, pick: req.body.pick }).update(
                    {
                        draftPickDeadline: draftPickDeadline
                    }
                ).then(data => {
                    res.status(200).json({ success: true, data: data, user: req.user.username, currentDraftPick: {pick: nextPick, round: round, draftPickDeadline: nextPickDeadline} });
                })
                .catch(err => {
                    console.error('Error ', err);
                });
            } else {
                if(req.body.pick == 14){
                    nextPick = 1;
                    round = parseInt(req.body.round) + 1
                } else {
                    nextPick = parseInt(req.body.pick) + 1
                    round = req.body.round
                }
        
                const next = draft.find((dp) => dp.pick == nextPick && dp.round == round);
                sendEmailToNextPick(next)

                nextPickDeadline = setDraftPickDeadline()
                knex('draft').where({ round: round, pick: nextPick }).update(
                    {
                        draftPickDeadline: nextPickDeadline
                    }
                ).then(data => {
                    res.status(200).json({ success: true, data: data, user: req.user.username, currentDraftPick: {pick: nextPick, round: round, draftPickDeadline: nextPickDeadline} });
                })
                .catch(err => {
                    console.error('Error ', err);
                });
            }
        })
        .catch(err => {
            console.error('Error ', err);
        });
    } else {
        res.status(200).json({ success: true, user: req.user.username, message: "all draft timers are over" });
    }
});

router.get('/draft/timer', async (req, res) => {
    const currentDraftPick = await getCurrentPick();
    if(req.user){
        res.status(200).json({ success: true, data: currentDraftPick, user: req.user.username});
    } else {
        res.status(200).json({ success: true, data: currentDraftPick});  
    }
})

router.put('/draft/timer', (req, res) => {
    let currentDate = new Date();
    if(req.body.timer.includes("seconds")){
        currentDate.setSeconds(currentDate.getSeconds() + parseInt(req.body.timer.split(" seconds")[0]))
    } else if (req.body.timer.includes("minutes")){
        currentDate.setMinutes(currentDate.getMinutes() + parseInt(req.body.timer.split(" minutes")[0]))
    } else if (req.body.time.includes("hours")){
        currentDate.setHours(currentDate.getHours() + parseInt(req.body.timer.split(" hours")[0]))
    } else {
        res.status(422).json({ success: false, user: req.user.username, message: "Need to include type of time measurement" });
    }
    knex('draft').where({ round: req.body.round, pick: req.body.pick }).update(
        {
            draftPickDeadline: currentDate
        }
    ).then(data => {
        res.status(200).json({ success: true, user: req.user.username });
    })
    .catch(err => {
        console.error('Error ', err);
    });
})

router.get('/draft/reset', (req,res) => {
    knex('draft').update(
        {
            name: null,
            position: null,
            player_team: null,
            draftPickDeadline: '9999-12-31 00:00:00',
            draftPickMade: '9999-12-31 00:00:00' 
        }
    ).then(data => {
        res.status(200).json({ success: true, data: data, user: req.user.username });
    })
    .catch(err => {
        console.error('Error ', err);
    });
})

router.get('/players', (req, res) => {
    knex('players')
    .then(data => {
        res.status(200).json({ success: true, data: data });
    })
    .catch(err => {
        console.error('Error ', err);
    });
});

router.get('/teams', (req, res) => {
    knex('teams_players')
    .then(data => {
        res.status(200).json({ success: true, data: data });
    })
    .catch(err => {
        console.error('Error ', err);
    });
});

router.get('/teams/:team', (req, res) => {
    knex('teams_players')
        .where({team: req.params.team.split("&").join(" ")})
    .then(data => {
        res.status(200).json({ success: true, data: data });
    })
    .catch(err => {
        console.error('Error ', err);
    });
});

router.get('/keepers', (req, res) => {
    knex('teams_players')
        .select('*')
        .where({ keeper: true })
    .then(data => {
        res.status(200).json({ success: true, data: data });
    })
    .catch(err => {
        console.error('Error ', err);
    });
});

router.get('/keepers/:team', (req, res) => {
    knex('teams_players')
        .select('*')
        .where({ team: req.params.team.split("&").join(" ") })
    .then(data => {
        res.status(200).json({ success: true, data: data, user: req.user.username });
    })
    .catch(err => {
        console.error('Error ', err);
    });
});

router.put('/keepers/:team', (req, res) => {
    knex('teams_players').where({ team: req.params.team.split("&").join(" "), name: req.body.name }).update(
        {
          keeper: req.body.keeper
        },
    ).then(data => {
        res.status(200).json({ success: true, data: data, user: req.user.username });
    })
    .catch(err => {
        console.error('Error ', err);
    });
});

router.post("/trade", (req, res) => {
    knex("trades")
    .insert({
      initiator: req.body.initiator.team,
      receiver: req.body.receiver.team,
      initiator_players: req.body.initiator.trading.toString(),
      receiver_players: req.body.receiver.trading.toString()
    })
    .then(response => {
        //nodemailer email commish and receiver
        const email = {
            to: "draft-admin@froofydoog.com",
            subject: "A Trade has been made to you in Realm by " + req.body.initiator.team,
            message: "<p>"+req.body.initiator.team+" wants to trade you "+req.body.initiator.trading.toString()+" for "+req.body.receiver.trading.toString()+"</p>",
            commishSubject: "Local - A Trade has been made in Realm by " + req.body.initiator.team + " to " + req.body.receiver.team,
            commishMessage: req.body.initiator.team+" wants to trade "+req.body.receiver.team+" "+req.body.initiator.trading.toString()+" for "+req.body.receiver.trading.toString()
        }
        sendEmail(email)
        res.json({success: true, user: req.user.username, response});
    })
    .catch(error => {
        console.error('Error with a trade ', error);
        res.json({success: false, error})
    });
})

router.put("/trade", (req, res) => {
    let tradeObject
    if(req.body.action == "approved by commissioner"){
        knex('trades')
        .select('*')
        .where({ ID: req.body.ID })
        .then(tradeData => {
            const commissionersWhoApproved = tradeData[0].commissioners_who_approved != null ? tradeData[0].commissioners_who_approved.split(",") : [];
            
            if(commissionersWhoApproved.length == 3){
                tradeObject = []
                const tradeInitiator = tradeData[0].initiator;
                const tradeReceiver = tradeData[0].receiver;
                const tradeInitiatorTradedDraftPicks = tradeData[0].initiator_players.split(",").filter((t) => t.includes("Round"));
                const tradeInitiatorTradedPlayers = tradeData[0].initiator_players.split(",").filter((t) => !t.includes("Round"));
                const tradeReceiverTradedDraftPicks = tradeData[0].receiver_players.split(",").filter((t) => t.includes("Round"));
                const tradeReceiverTradedPlayers = tradeData[0].receiver_players.split(",").filter((t) => !t.includes("Round"));


                knex('trades').where({ ID: req.body.ID })
                .update(tradeObject)
                .then(response => {
                    //nodemailer email commish and receiver
                    // const email = {
                    //     to: "draft-admin@froofydoog.com",
                    //     subject: "A Trade has been made to you in Realm by " + req.body.initiator.team,
                    //     message: "<p>"+req.body.initiator.team+" wants to trade you "+req.body.initiator.trading.toString()+" for "+req.body.receiver.trading.toString()+"</p>",
                    //     commishSubject: "Local - A Trade has been made in Realm by " + req.body.initiator.team + " to " + req.body.receiver.team,
                    //     commishMessage: req.body.initiator.team+" wants to trade "+req.body.receiver.team+" "+req.body.initiator.trading.toString()+" for "+req.body.receiver.trading.toString()
                    // }
                    // sendEmail(email)
                    // res.json({success: true, response});
                    res.json({success: true, user: req.user.username, response})
                })
                .catch(error => {
                    console.error('Error with a trade ', error);
                    res.json({success: false, error})
                });
            } else {
                commissionersWhoApproved.push(req.user.username)   

                knex('trades').where({ ID: req.body.ID })
                .update({commissioners_who_approved: commissionersWhoApproved.join(",")})
                .then(response => {
                    //nodemailer email commish and receiver
                    // const email = {
                    //     to: "draft-admin@froofydoog.com",
                    //     subject: "A Trade has been made to you in Realm by " + req.body.initiator.team,
                    //     message: "<p>"+req.body.initiator.team+" wants to trade you "+req.body.initiator.trading.toString()+" for "+req.body.receiver.trading.toString()+"</p>",
                    //     commishSubject: "Local - A Trade has been made in Realm by " + req.body.initiator.team + " to " + req.body.receiver.team,
                    //     commishMessage: req.body.initiator.team+" wants to trade "+req.body.receiver.team+" "+req.body.initiator.trading.toString()+" for "+req.body.receiver.trading.toString()
                    // }
                    // sendEmail(email)
                    // res.json({success: true, response});
                    res.json({success: true, user: req.user.username, response})
                })
                .catch(error => {
                    console.error('Error with a trade ', error);
                    res.json({success: false, error})
                });
            }


        })
        .catch(err => {
            console.error('Error ', err);
        });
    } else {
        if(req.body.action == "rejected by receiver" || req.body.action == "rejected by commissioner"){
            tradeObject = {rejected: true}
        } else if (req.body.action == "accepted by receiver"){
            tradeObject = {approved_by_receiver: true}
        } else if (req.body.action == "approved by commissioner"){
            tradeObject = {commissioner_approved: true}
        }
        knex('trades').where({ ID: req.body.ID })
        .update(tradeObject)
        .then(response => {
            //nodemailer email commish and receiver
            // const email = {
            //     to: "draft-admin@froofydoog.com",
            //     subject: "A Trade has been made to you in Realm by " + req.body.initiator.team,
            //     message: "<p>"+req.body.initiator.team+" wants to trade you "+req.body.initiator.trading.toString()+" for "+req.body.receiver.trading.toString()+"</p>",
            //     commishSubject: "Local - A Trade has been made in Realm by " + req.body.initiator.team + " to " + req.body.receiver.team,
            //     commishMessage: req.body.initiator.team+" wants to trade "+req.body.receiver.team+" "+req.body.initiator.trading.toString()+" for "+req.body.receiver.trading.toString()
            // }
            // sendEmail(email)
            // res.json({success: true, response});
            res.json({success: true, user: req.user.username, response})
        })
        .catch(error => {
            console.error('Error with a trade ', error);
            res.json({success: false, error})
        });
    }
})

router.get("/trades", (req,res) => {
    knex('trades')
    .then(data => {
        res.status(200).json({ success: true, data: data });
    })
    .catch(err => {
        console.error('Error ', err);
    });
})

module.exports = router;