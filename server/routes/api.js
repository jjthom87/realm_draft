const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile.js'));
const { runDraftTimer, getCurrentPick, setDraftPickDeadline, getDraft } = require('../api/draft.js');

runDraftTimer();

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
    if(req.body.draftPickDeadline && req.body.draftPickDeadline.toString().includes('6666') && req.body.name == null){
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

    knex('draft').where({ round: req.body.round, pick: req.body.pick }).update(draftPickObject)
    .then(async(data) => {
        let nextPick;
        let round;
        if(req.body.draftPickDeadline && req.body.draftPickDeadline.includes("6666")){
            const draft = await getDraft();
            const next = draft.find((dp) => dp.name == null && !dp.draftPickDeadline.toString().includes("6666"));
            nextPick = next.pick;
            round = next.round;
        } else if(req.body.pick == 14){
            nextPick = 1;
            round = parseInt(req.body.round) + 1
        } else {
            nextPick = parseInt(req.body.pick) + 1
            round = req.body.round
        }

        const nextPickDeadline = setDraftPickDeadline()
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
    })
    .catch(err => {
        console.error('Error ', err);
    });
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
        res.status(200).json({ success: true, data: data, user: req.user.username });
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

})

module.exports = router;