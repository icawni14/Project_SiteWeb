"use strict"

const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');



exports.login_user= (nameUser, password) => { //login utilisateur 
    let getId = db.prepare('SELECT idUser FROM Utilisateur WHERE nameUser = ? and password = ?').get(nameUser,password);
    if ( getId === undefined)
      return -1;
    return getId.idUser;
};
exports.login_prop= (nameProprio, password) => { //login de l'admin
    let getId = db.prepare('SELECT idProprio FROM admin WHERE nameProprio = ? and password = ?').get(nameProprio,password);
    if ( getId === undefined)
      return -1;
    return getId.idProp;
};


exports.new_user = (nameUser,password) => { //cree un nouveau utilisateur 
  let newUser = db.prepare('INSERT INTO Utilisateur (nameUser, password) values ( ?, ? )').run(nameUser,password);
  return newUser.lastInsertRowid;
};

exports.create = function(particulier) { //ajouter un rendez_vous
  let id = db.prepare('INSERT INTO particulier (name, img, adresse, code, tel, heureOuverture, heureFermeture) VALUES (@name, @img, @adresse, @code, @tel, @heureOuverture, @heureFermeture);').run(particulier);
  return id.lastInsertRowid;
};

exports.read = (id) => { //lire la liste des centres 
  var found = db.prepare('SELECT * FROM particulier WHERE id_particulier = ? ').get(id);
  return found;
};



exports.search = (query, page) => {  //afficher les infos des centres 
  const num_per_page = 32;
  query = query || "";
  page = parseInt(page || 1);

  var num_found = db.prepare('SELECT count(*) FROM particulier WHERE name LIKE ? ').get('%' + query + '%')['count(*)'];
  var results = db.prepare('SELECT id_particulier as entry, name, img FROM particulier WHERE name LIKE ? ORDER BY id_particulier LIMIT ? OFFSET ?').all('%' + query + '%', num_per_page, (page - 1) * num_per_page);

  return {
    results: results,
    num_found: num_found,
    query: query,
    next_page: page + 1,
    page: page,
    num_pages: parseInt(num_found / num_per_page) + 1,
  };
};


exports.update = function(id, particulier) { //mettre a jour les infos du centre 
  var result = db.prepare('UPDATE particulier SET name = @name, adresse = @adresse, code = @code, tel = @tel, heureOuverture = @heureOuverture, heureFermeture = @heureFermeture, img = @img WHERE id_particulier = ?').run(particulier, id);
  return result;
};


exports.delete = function(id_particulier) { //supprimer un centre
  db.prepare('DELETE FROM particulier WHERE id_particulier = ?').run(id_particulier);
}

exports.reserve = function(idUser, id_particulier ,  heure, date){ //pour que l'utilisateur reserve dans un centre
  let reserve = db.prepare('INSERT INTO rendez_vous (idUser, id_particulier, heure, date) VALUES (?, ?, ?, ?)').run(idUser, id_particulier, heure, date);

  return reserve;
}

exports.deleteRDV = function(id_particulier){ //supprimer un rendez-vous pris par l'utilisateur 
  let num_found = db.prepare('DELETE FROM rendez_vous WHERE id_particulier = ?').run(id_particulier);
  return num_found;
};





exports.DetailMesRendezVous = function(idUser) { //affiche les details du rendez-vous d'un utilisateur
  //var found = db.prepare('SELECT * FROM rendez_vous WHERE idUser = ?  ').get(idUser);
  var found = db.prepare('SELECT X.heure , X.date, Y.name   FROM particulier Y, rendez_vous X WHERE Y.id_particulier = X.id_particulier AND X.id_particulier = ? ').get(idUser);

  return found;
}

exports.ListRendezVous =   function(idUser) { //affiche toute la liste des rendez-vous de l'utilisateur
  var num_found = db.prepare('SELECT X.name, X.img, Y.id_particulier FROM particulier X, rendez_vous Y WHERE X.id_particulier = Y.id_particulier and Y.idUser = ?').all(idUser);

  return {
    num_found: num_found,
  };
};
