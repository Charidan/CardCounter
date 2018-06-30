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

const about = (req, res) => { res.json({name: 'card-counter-server', displayName: 'About Page by Richard Nicholson', version: '0.0.1'})};
router.get('/', about);
router.get('/about', about);

// GET list games
// POST create game
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

// GET list all decks (across games)
// POST create deck
router.route('/decks')
      .get((req, res) => { Deck.find().exec((err,ret) => (err ? fail(err) : res.json(ret))) })
      .post((req, res) => {
          let game = Game.findOne({_id: req.body.gameid});
          if(game == null) {
              fail("ERROR: attempt to create deck for non-existant game", res);
              return;
          }

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
                      let card = new Card({value: i, gameid: req.body.gameid, deckid: id});
                      deck.putOnBottom(card);
                  }
              }

              deck.markModified('cards');
              return deck.save((err) => err ? fail(err, res) : res.json(deck));
          });
      });

// GET list decks of specified game
router.get('/decks/:gameid', (req,res) => { Deck.find({game: req.params.gameid}).exec((err,ret) => (err ? fail(err) : res.json(ret))) });

// POST shuffle deck
router.post('/deck/:deckid/shuffle', (req, res) => {
    let deck = Deck.findOne({_id: req.params.deckid});
    if(deck == null) {
        fail("ERROR: attempt to shuffle non-existant deck", res);
        return;
    }

    deck.shuffle();
    deck.save((err) => err ? fail(err, res) : res.json(deck));
});

// POST draw a card from deck
router.post('/deck/:deckid/draw', (req, res) => {
    let deck = Deck.findOne({_id: req.params.deckid});
    if(deck == null) {
        fail("ERROR: attempt to shuffle non-existant deck", res);
        return;
    }

    let card = deck.drawCard();
    deck.markModified('cards');
    deck.save();
    res.json([card, deck]);
});

// POST put card by id on bottom of deck by id
router.post('/deck/:deckid/putbottom/:cardid', (req, res) => {
    let deck = Deck.findOne({_id: req.params.deckid});
    if(deck == null) {
        fail("ERROR: attempt to place card in non-existant deck", res);
        return;
    }

    let card = Card.findOne({_id: req.params.cardid});
    if(card == null) {
        fail("ERROR: attempt to place non-existant card in deck", res);
        return;
    }

    deck.putOnBottom(card);
    deck.markModified('cards');
    deck.save((err) => err ? fail(err, res) : res.json(deck));
});

// POST create card for deck, place on bottom
router.post('/deck/:deckid/createbottom/', (req, res) =>{
    let deck = Deck.findOne({_id: req.params.deckid});
    if(deck == null) {
        fail("ERROR: attempt to place card in non-existant deck");
        return;
    }

    let card = new Card({value: i, gameid: deck.gameid, deckid: req.params.deckid});

    deck.putOnBottom(card);
    deck.markModified('cards');
    deck.save((err) => err ? fail(err, res) : res.json(deck));
});

// POST update card
router.post('/card/:cardid/update', (req, res) => {
    let card = Card.findOne({_id: req.params.cardid});
    if(card == null) {
        fail("ERROR: attempt to update non-existant card", res);
        return;
    }

    card.value = req.body.value;
    card.save((err) => err ? fail(err, res) : res.json(card));
});

// TESTING STUFF THAT WILL EVENTUALLY BE DELETED

var test_id = null;
router.route('/savetest')
      .get((req, res) => {
          Game.count().exec((err, ret) => {
              if(err) { fail(err, ret); return; }
              let id = ret + 1;
              let game = new Game();
              game.name = ('Save Test '+id);
              game.id = id;
              test_id = id;

              Deck.count().exec((err, ret) => {
                  if(err) { fail(err, ret); return; }
                  let id = ret + 1;
                  let deck = new Deck();
                  deck.name = 'Test Deck '+id;
                  deck.id = id;
                  deck.gameid = game.id;

                  for(let i = 1; i <= 2; i++)
                  {
                      let card = new Card({value: i, gameid: game.id, deckid: id});
                      deck.putOnBottom(card);
                      card.save((err) => err ? fail(err, res) : res.json(card));
                  }

                  deck.save((err) => err ? fail(err, res) : res.json(deck));

                  game.decks.push(deck);
                  console.log("created deck: " + game.decks);
                  game.save((err) => err ? fail(err, res) : res.json(game));
              });
          });
      })
      .post((req,res) => {
          Game.findOne({id: test_id}).populate({path: 'decks', populate: { path: 'cards' }}).exec((err, game) =>
          {
              console.log("err = " + err + "\n\n");
              console.log("GAME\n"+game);
              game.decks[0].cards[0].value = 999;
              console.log("DECK\n"+game.decks[0]);
              console.log("CARDS\n"+game.decks[0].cards[0].value);
              game.markModified('decks');
              game.save();
              //game.decks[0].cards[0].save();
          });
      });

/////////////////////////////////////////////////////////

server.use('/cardcounter', router);
const port = process.env.PORT || 2837;
server.listen(port);
console.log("CardCounter Server running on port "+port);