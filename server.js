"use strict"

var express = require('express');
var mustache = require('mustache-express');

var model = require('./model');
var app = express();


const cookieSession = require('cookie-session');
app.use(cookieSession({
  secret: 'mot-de-passe-du-cookie',
}));


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');


function user_is_authenticated(req, res, next){
  if(req.session.Utilisateur === undefined)
    res.status(401).send("Erreur Pas D'utilisateur");
  else
    next();
}

function prop_is_authenticated(req, res, next){
  if(req.session.admin === undefined)
    res.status(401).send("Erreur Pas D'utilisateur");
  else
    next();
}

function user_is_defined(req, res, next){
  //console.log(req.session.Utilisateur);
  if(req.session.Utilisateur === undefined)
    res.locals.authenticated1 = false;
  else {
    res.locals.authenticated1 = true;
    res.locals.nameUser = req.session.Utilisateur;
  }
  next();
}
app.use(user_is_defined);

function proprio_is_defined(req, res, next){
  //console.log(req.session.admin);
  if(req.session.admin === undefined)
    res.locals.authenticated2 = false;
  else {
    res.locals.authenticated2 = true;
    res.locals.nameProp = req.session.admin;
  }
  next();
}
app.use(proprio_is_defined);



app.get('/', (req, res) => {
  res.render('index');
});
app.get('/aboutUs', (req, res) => {
  res.render('aboutUs');
});


//login admin
app.get('/login_prop',(req, res) =>{ 
  res.render('login_prop');
});

//login utilisateur
app.get('/login_user',(req, res) =>{ 
  res.render('login_user');
});


//nouveau utilisateur
app.get('/new_user',(req, res) => {
  res.render('new_user');
});

//cree un centre
app.get('/create',(req, res) => {
  res.render('create');
});

//reserve un rendez-vous
app.get('/reserve/:id_particulier',(req, res) => {
  let x = model.read(req.params.id_particulier);
  res.render('reserve',x);
});


//donne details de chaque centre
app.get('/read/:id_particulier', (req, res) => {
  var found = model.read(req.params.id_particulier);
  res.render('read', found);
});

//modifier les infos d'un centre
app.get('/update/:id_particulier',(req, res) => {
  let entry = model.read(req.params.id_particulier);
  res.render('update', entry);
});

//avoir toute la liste des centre
app.get('/search', (req, res) => {
  var found = model.search(req.query.query, req.query.page);
  res.render('search', found);
});

//supprimer un centre
app.get('/delete/:id_particulier', (req, res) => {
  let entry = model.read(req.params.id_particulier);
  res.render('delete', {id_particulier: req.params.id_particulier, name: entry.name});
});

//supprimer un rendez-vous pris par un utilisateur 
app.get('/deleteRDV/:id_particulier', (req, res) =>{
  //console.log("test");
  let num_found = req.params.id_particulier;
  let x = model.read(req.params.id_particulier);
  //console.log(x);
  res.render('deleteRDV', x);
});

//affiche les details du rendez-vous dans un centre
app.get('/DetailMesRendezVous/:id_particulier', (req, res) => {
  let num_found = req.params.id_particulier;
  let x = model.DetailMesRendezVous(req.params.id_particulier);
  x["id_particulier"] = num_found;
  console.log(x);
  res.render('DetailMesRendezVous', x);
});

//affiche touts les centres où l'utilisateur a pris un rendez-vous
app.get('/ListRendezVous', (req, res) => {

  var found = model.ListRendezVous(req.session.idUtilisateur);
  res.render('ListRendezVous', found);
});

app.get('/politique', (req,res) =>{
  res.render('politique');
});

//login admin
app.post('/login_prop', (req, res) => {

  console.log(req.body.nameProp,req.body.password);
  if(model.login_prop(req.body.nameProp,req.body.password) === -1)
    res.redirect('/proplog');
  else {
    req.session.admin = req.body.nameProp;
    res.redirect('/');

  }
});

//login utilisateur
app.post('/login_user', (req, res) => {
  console.log(req.body.nameUser,req.body.password);
  var id = model.login_user(req.body.nameUser,req.body.password)
  if(id === -1)
    res.redirect('/login_user');
  else {
    req.session.Utilisateur = req.body.nameUser;
    req.session.idUtilisateur = id;
    res.redirect('/');

  }
});

//nouveau utilisateur
app.post('/new_user', (req,res)=> {
  let id = model.new_user(req.body.name, req.body.password);
  res.redirect('/login_user');
});

//se deconnecter 
app.post('/logout',(req, res) => {
    req.session.Utilisateur = undefined;
    req.session.admin = undefined;
  res.redirect('/');
});

// creer un nouveau centre
app.post('/create', (req, res) => {
  var id = model.create(post_data_to_recipe(req));
  res.redirect('/');
});

//pour recuperer details des centres
function post_data_to_recipe(req) {
  return {

    name: req.body.name,
    img : req.body.img,
    adresse: req.body.adresse,
    code: req.body.code,
    tel: req.body.tel,
    heureOuverture: req.body.heureOuverture,
    heureFermeture: req.body.heureFermeture,

  };
}

//mettre a jour infos centre
app.post('/update/:id_particulier', (req, res) => {
  var id_particulier = req.params.id_particulier;
  model.update(id_particulier, post_data_to_recipe(req));
  res.redirect('/read/' + id_particulier);
});

//supprimer un centre
app.post('/delete/:id_particulier', (req, res) => {
  model.delete(req.params.id_particulier);
  res.redirect('/');
});

//reserver un rendez-vous chez un centre 
app.post('/reserve/:id_particulier', (req, res) => {
console.log( req.session.idUtilisateur);
  console.log(req.body);
  console.log(req.params.id_particulier);
  model.reserve( req.session.idUtilisateur, req.params.id_particulier,req.body.heure, req.body.date);
  res.redirect('/');
});

//supprimer rendez-vous
app.post('/deleteRDV/:id_particulier', (req, res) => {
  model.deleteRDV(req.params.id_particulier);
  res.redirect('/');
});



app.listen(3000, () => console.log('listening on http://localhost:3000'));
