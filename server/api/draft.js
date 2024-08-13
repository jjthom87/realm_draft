const knex = require('knex')(require('../knexfile.js'));

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