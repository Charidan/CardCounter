const express     = require('express');
const server      = express();
const bodyParser  = require('body-parser');
const mongoose    = require('mongoose');
mongoose.connect('mongodb://localhost:27017/cardcounter', {
    useMongoClient: true,
});

//MODELS ///////////////////////////////////////////////
const Game = require('./models/game').Game;
const Deck = require('./models/deck').Deck;
const Card = require('./models/card').Card;
////////////////////////////////////////////////////////

//Utilities ////////////////////////////////////////////
const fail = (err_msg,res) => {
    console.error(err_msg);
    res.status(500).send({error: err_msg});
};

////////////////////////////////////////////////////////

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});

const router = express.Router();

//ROUTES ////////////////////////////////////////////////
router.use((req, res, next) => {
    // permission check goes here
    // return without calling next() to deny

    next(); // permission granted
});

const about = (req, res) => { res.json({name: 'card-counter-server', displayName: 'About Page by Richard Nicholson', version: '0.0.1'})}
router.get('/', about);
router.get('/about', about);
router.route('/games')
      .get((req, res) => { Game.find().exec((err,ret) => (err ? fail(err) : res.json(ret))) })
      .post((req, res) => {
          Game.count().exec((err, ret) => {
              if(err) { fail(err, ret); return; }
              let id = ret + 1;
              let game = new Game();
              game.name = (req.body.name ? req.body.name : ('Game'+id));
              game.id = id;
              game.save((err) => err ? fail(err, res) : res.json(game));
          })
      });
router.route('/decks')
      .get((req, res) => { Deck.find().exec((err,ret) => (err ? fail(err) : res.json(ret))) })
      .post((req, res) => {
          Deck.count().exec((err, ret) => {
              if(err) { fail(err, ret); return; }
              let id = ret + 1;
              let deck = new Deck();
              deck.name = (req.body.name ? req.body.name : ('Deck'+id));
              deck.id = id;
              deck.gameid = req.body.gameid;

              if(req.body.rangeMin != null && req.body.rangeMax != null)
              {
                  for(let i = req.body.rangeMin; i <= req.body.rangeMax; i++)
                  {
                      deck.putOnBottom(new Card({value: i, gameid: req.body.gameid, deckid: id}));
                  }
              }

              deck.save((err) => err ? fail(err, res) : res.json(deck));
          })
      });

/////////////////////////////////////////////////////////

server.use('/cardcounter', router);
const port = process.env.PORT || 2837
server.listen(port);
console.log("CardCounter Server running on port "+port);