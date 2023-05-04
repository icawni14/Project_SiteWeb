const fs = require('fs');
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

  db.prepare('DROP TABLE IF EXISTS tag_perso').run();
  db.prepare('DROP TABLE IF EXISTS rendez_vous').run();
  db.prepare('DROP TABLE IF EXISTS admin').run();
  db.prepare('DROP TABLE IF EXISTS particulier').run();
  db.prepare('DROP TABLE IF EXISTS Utilisateur').run();
  db.prepare('DROP TABLE IF EXISTS tags').run();


  db.prepare('CREATE TABLE particulier ( id_particulier INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT , img TEXT, adresse TEXT , code postal INTEGER , tel INTEGER , heureOuverture TIME , heureFermeture TIME  )').run();
  db.prepare('CREATE TABLE Utilisateur ( idUser INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nameUser TEXT NOT NULL, password TEXT NOT NULL)').run();
  db.prepare('CREATE TABLE rendez_vous ( idUser INTEGER REFERENCES Utilisateur, id_particulier INTEGER REFERENCES particulier, heure TIME NOT NULL, date DATE NOT NULL, PRIMARY KEY(idUser,id_particulier)  )').run();

  db.prepare('CREATE TABLE admin ( idProprio INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nameProprio TEXT NOT NULL, password TEXT NOT NULL)').run();

  db.prepare('CREATE TABLE tags ( id_tag INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, type_name TEXT NOT NULL )').run();
  db.prepare('CREATE TABLE tag_perso ( id_tag INTEGER REFERENCES tags, id_particulier INTEGER REFERENCES particulier ,PRIMARY KEY(id_tag, id_particulier) )').run();
