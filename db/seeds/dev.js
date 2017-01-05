/*eslint-disable func-names*/
'use strict';

exports.seed = (knex) => (
  knex('Team').insert({
    teamName: "TeamAwesome",
    description: "we are awesome",
    active: 1,
    docId: null
  })

  .then((team) => (
    knex('Team').insert({
      teamName: "Nörtittäret",
      description: "kolme innokasta pelaajaa kalliosta",
      active: 1,
      docId: null
    })
  ))

  .then(() => (
    knex('Team').insert({
      teamName: "Voittajat",
      description: "korsosta me tullaa ja kovia me ollaan! Loppuun asti tsempataan ja kaikki meitä kannustaa!",
      active: 1,
      docId: null
    })
  ))
  .then(() => (
    knex('Team').insert({
      teamName: "ABBA",
      description: "awesome bravehearted beauties from Alppila",
      active: 1,
      docId: null
    })
  ))

  .then(() => (
    knex('Company').insert({
      companyName: "Rovio",
      password: "AngryB1rd5",
      docId: null
    })
  ))

  .then(() => (
    knex('Company').insert({
      companyName: "Super Ada",
      password: "AdaSupperDupper",
      docId: null
    })
  ))

  .then(() => (
    knex('Company').insert({
      companyName: "Futurice",
      password: "R4inbowUn1Corn",
      docId: null
    })
  ))

  .then(() => (
    knex('Company').insert({
      companyName: "XBOX",
      password: "T1t4nFall",
      docId: null
    })
  ))

  .then(() => (
    knex('CompanyPoint').insert({
      point: 3,
      teamId: 1,
      companyId: 1
    })
  ))

  .then(() => (
    knex('CompanyPoint').insert({
      point: 5,
      teamId: 2,
      companyId: 2
    })
  ))

  .then(() => (
    knex('CompanyPoint').insert({
      point: 1,
      teamId: 3,
      companyId: 4
    })
  ))

  .then(() => (
    knex('CompanyPoint').insert({
      point: 4,
      teamId: 4,
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
      adminName: "Admin",
      password: "Adm1n4dmin"
    })
  ))
);
