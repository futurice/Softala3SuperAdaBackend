/*eslint-disable func-names*/
'use strict';

exports.seed = (knex) => (
  knex('Team').insert({
    teamName: "TeamAwesome",
    description: "we are awesome",
    docId: null
  })

  .then(() => (
    knex('Team').insert({
      teamName: "TeamAwesome2",
      description: "we are awesome2",
      docId: null
    })
  ))

  // TODO: logos
  .then(() => (
    knex('Company').insert({
      companyName: "Futurice",
      docId: null
    })
  ))
  .then(() => (
    knex('Company').insert({
      companyName: "Vincit",
      docId: null
    })
  ))
  .then(() => (
    knex('Company').insert({
      companyName: "Insinööriliitto",
      docId: null
    })
  ))
  .then(() => (
    knex('Company').insert({
      companyName: "Ericsson",
      docId: null
    })
  ))
  .then(() => (
    knex('Company').insert({
      companyName: "Reaktor",
      docId: null
    })
  ))
  .then(() => (
    knex('Company').insert({
      companyName: "Zalando",
      docId: null
    })
  ))
  .then(() => (
    knex('Company').insert({
      companyName: "Tietoturva ry",
      docId: null
    })
  ))
  .then(() => (
    knex('Company').insert({
      companyName: "Demi",
      docId: null
    })
  ))

  .then(() => (
    knex('Company').insert({
      companyName: "Koulut",
      docId: null
    })
  ))

  .then(() => (
    knex('CompanyPoint').insert({
      points: 5,
      teamId: 1,
      companyId: 1
    })
  ))

  .then(() => (
    knex('CompanyPoint').insert({
      points: 3,
      teamId: 1,
      companyId: 2
    })
  ))

  .then(() => (
    knex('CompanyPoint').insert({
      points: 2,
      teamId: 1,
      companyId: 3
    })
  ))

  .then(() => (
    knex('CompanyPoint').insert({
      points: 2,
      teamId: 2,
      companyId: 3
    })
  ))

  .then(() => (
    knex('Question').insert({
      questionText: 'Anna kouluarvosana tapahtumalle (1-5)',
      questionType: 'radio',
      numButtons: 5,
      labels: JSON.stringify([1, 2, 3, 4, 5])
    })
  ))

  .then(() => (
    knex('Question').insert({
      questionText: 'Mistä sait tiedon tapahtumasta?',
      questionType: 'text'
    })
  ))

  .then(() => (
    knex('Question').insert({
      questionText: 'Innostuitko IT-alasta?',
      questionType: 'radio',
      numButtons: 2,
      labels: JSON.stringify(['Kyllä', 'Ei'])
    })
  ))

  .then(() => (
    knex('Question').insert({
      questionText: 'Muuttuiko käsityksesi IT-alasta?',
      questionType: 'radio',
      numButtons: 2,
      labels: JSON.stringify(['Kyllä', 'Ei'])
    })
  ))

  .then(() => (
    knex('Question').insert({
      questionText: 'Voisitko kuvitella meneväsi IT-alalle töihin?',
      questionType: 'radio',
      numButtons: 2,
      labels: JSON.stringify(['Kyllä', 'Ei'])
    })
  ))

  .then(() => (
    knex('Question').insert({
      questionText: 'Kehitysehdotuksia seuraavan Super-Ada -tapahtuman järjestäjille?',
      questionType: 'text'
    })
  ))

  .then(() => (
    knex('Admin').insert({
      email: 'foo@bar.com',
      password: '$2a$10$kWUT5ygKjj8XwsmgA7gTne6xx9yEzRWm2pMmwB0yndEJhRP7buOza' // 'foobar'
    })
  ))
);
