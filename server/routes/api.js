const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile.js'));
const { runDraftTimer, getCurrentPick } = require('../api/draft.js');

runDraftTimer();

router.get('/draft', (req, res) => {
    knex('draft')
    .then(data => {
        res.status(200).json({ success: true, data: data });
    })
    .catch(err => {
        console.error('Error ', err);
    });
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

router.put('/draft/pick', (req, res) => {
    knex('draft').where({ round: req.body.round, pick: req.body.pick }).update(
        {
          name: req.body.name,
          position: req.body.position,
          player_team: req.body.player_team
        }
    ).then(data => {
        let pick;
        let round;
        if(req.body.pick == 14){
            pick = 1;
            round = req.body.round + 1
        } else {
            pick = req.body.pick + 1
            round = req.body.round
        }

        res.status(200).json({ success: true, data: data, user: req.user.username, currentDraftPick: {pick: pick, round: round, timer: 0} });
    })
    .catch(err => {
        console.error('Error ', err);
    });
});

router.get('/draft/timer', async (req, res) => {
    const currentDraftPick = await getCurrentPick();
    res.status(200).json({ success: true, data: currentDraftPick});
})

router.put('/draft/timer', (req, res) => {
    knex('draft').where({ round: req.body.round, pick: req.body.pick }).update(
        {
          timer: req.body.timer,
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
          timer: 0
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