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
// POST create gameid
router.route('/games')
      .get((req, res) => { Game.find().exec((err,ret) => (err ? fail(err) : res.json(ret))) })
      .post((req, res) => {
          Game.count().exec((err, ret) => {
              if(err) { fail(err, res); return; }
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
          let game = Game.findOne({_id: mongoose.Types.ObjectId(req.body.gameid)});
          if(game == null) {
              fail("ERROR: attempt to create deck for non-existant gameid", res);
              return;
          }

          Deck.count().exec((err, ret) => {
              if(err) { fail(err, res); return; }
              let id = ret + 1;
              let deck = new Deck();
              deck.name = (req.body.name ? req.body.name : ('Deck'+id));
              deck.id = id;
              deck.game = req.body.gameid;

              if(req.body.rangeMin != null && req.body.rangeMax != null)
              {
                  for(let i = req.body.rangeMin; i <= req.body.rangeMax; i++)
                  {
                      let card = new Card({_id: mongoose.Types.ObjectId(), value: i, game: req.body.gameid, deckid: id});
                      console.log(card._id);
                      deck.putOnBottom(card);
                  }
              }

              deck.markModified('cards');
              return deck.save((err) => err ? fail(err, res) : res.json(deck));
          });
      });

// GET list decks of specified gameid
router.get('/decks/:gameid', (req,res) => { Deck.find({game: mongoose.Types.ObjectId(req.params.gameid)}).exec((err, ret) => (err ? fail(err) : res.json(ret))) });

// GET deck by id
router.get('/deck/:deckid', (req,res) => { Deck.findOne({_id: mongoose.Types.ObjectId(req.params.deckid)}).exec((err, ret) => (err ? fail(err) : res.json(ret))) });


// POST shuffle deck
router.post('/deck/:deckid/shuffle', (req, res) => {
    Deck.findOne({_id: mongoose.Types.ObjectId(req.params.deckid)}).exec((err, deck) =>
    {
        if(err)
        {
            fail(err, res);
            return;
        }

        if(deck == null)
        {
            fail("ERROR: attempt to shuffle non-existant deck", res);
            return;
        }

        deck.shuffle();
        deck.markModified('cards');
        deck.save((err) => err ? fail(err, res) : res.json(deck));
    });
});

// POST draw a card from deck
router.post('/deck/:deckid/draw', (req, res) => {
    Deck.findOne({_id: mongoose.Types.ObjectId(req.params.deckid)}).exec((err, deck) =>
    {
        if(err)
        {
            fail(err, res);
            return;
        }

        if(deck == null)
        {
            fail("ERROR: attempt to shuffle non-existant deck", res);
            return;
        }

        let card = deck.drawCard();
        deck.markModified('cards');
        deck.save((err) => err ? fail(err, res) : res.json([card, deck]));
    });
});

// POST put card by id on bottom of deck by id
router.post('/deck/:deckid/putbottom/drawn', (req, res) => {
    Deck.findOne({_id: mongoose.Types.ObjectId(req.params.deckid.toString())}).exec((err, deck) =>
    {
        if(err)
        {
            fail(err, res);
            return;
        }

        if(deck == null)
        {
            fail("ERROR: attempt to place card in non-existant deck", res);
            return;
        }

        deck.putOnBottom(deck.drawnCard);
        deck.drawnCard = null;
        deck.markModified('cards');
        deck.save((err) => err ? fail(err, res) : res.json(deck));
    });
});

// POST create card for deck, place on bottom
router.post('/deck/:deckid/createbottom/', (req, res) =>{
    Deck.findOne({_id: mongoose.Types.ObjectId(req.params.deckid)}).exec((err, deck) =>
    {
        if(err)
        {
            fail(err, res);
            return;
        }

        if(deck == null)
        {
            fail("ERROR: attempt to create card in non-existant deck", res);
            return;
        }

        let card = new Card({_id: mongoose.Types.ObjectId(), value: req.body.value, game: deck.game, deckid: req.params.deckid});

        deck.putOnBottom(card);
        deck.markModified('cards');
        deck.save((err) => err ? fail(err, res) : res.json(deck));
    });
});

// POST move card in deck by index
router.post('/deck/:deckid/move/', (req, res) =>
{
    Deck.findOne({_id: mongoose.Types.ObjectId(req.params.deckid)}).exec((err, deck) =>
    {
        if((req.body.index <= 0 && req.body.up) || (req.body.index >= deck.cards.length && !req.body.up)) return;

        let targetIndex = req.body.up ? req.body.index - 1 : req.body.index + 1;
        let swap = deck.cards[req.body.index];
        deck.cards[req.body.index] = deck.cards[targetIndex];
        deck.cards[targetIndex] = swap;

        deck.markModified('cards');
        deck.save((err) => err ? fail(err, res) : res.json(deck));
    });
});

// POST delete a card from deck
router.post('/deck/:deckid/deleteCard', (req, res) =>
{
    Deck.findOne({_id: mongoose.Types.ObjectId(req.params.deckid)}).exec((err, deck) =>
    {
        for(let i = 0; i < deck.cards.length; ++i)
        {
            if(deck.cards[i]._id.equals(mongoose.Types.ObjectId(req.body.cardid)))
            {
                let card = deck.cards.splice(i, 1);
                deck.markModified('cards');
                deck.save((err) => err ? fail(err, res) : res.json(deck));
                return;
            }
        }

        fail("Error: Attempting to remove card " + req.body.cardid + " which is not in deck " + deck._id, res);
    });
});

// POST delete a card from deck
router.post('/deck/:deckid/destroyDrawnCard', (req, res) =>
{
    Deck.findOne({_id: mongoose.Types.ObjectId(req.params.deckid)}).exec((err, deck) =>
    {
        deck.drawnCard = null;
        deck.markModified('drawnCard');
        deck.save((err) => err ? fail(err, res) : res.json(deck));
    });
});

// POST create card for deck, place on bottom
router.post('/deck/:deckid/updateSetting/', (req, res) =>{
    Deck.findOne({_id: mongoose.Types.ObjectId(req.params.deckid)}).exec((err, deck) =>
    {
        if(err)
        {
            fail(err, res);
            return;
        }

        if(deck == null)
        {
            fail("ERROR: attempt to update setting of non-existant deck", res);
            return;
        }

        // the save() will auto-validate our fields if they fail to match the schema
        Object.assign(deck, req.body);

        deck.save((err) => err ? fail(err, res) : res.json(deck));
    });
});

// GET get card by index
// POST update card
router.route('/deck/card/:index')
    .get((req,res) => { Deck.findOne({_id: mongoose.Types.ObjectId(req.params.deckid)}).exec((err, deck) => (err ? fail(err, res) : res.json(deck.cards[req.params.index]))) })
    .post((req, res) => {
        Deck.findOne({_id: mongoose.Types.ObjectId(req.params.deckid)}).exec((err, deck) =>
        {
            if(err)
            {
                fail(err, res);
                return;
            }

            if(deck == null)
            {
                fail("ERROR: attempt to update non-existant card", res);
                return;
            }

            deck.cards[req.params.index].value = req.body.card.value;
            deck.cards[req.params.index].faceup = req.body.card.faceup;
            deck.save((err) => err ? fail(err, res) : res.json(deck));
        });
    });

/////////////////////////////////////////////////////////

server.use('/cardcounter', router);
const port = process.env.PORT || 2837;
server.listen(port);
console.log("CardCounter Server running on port "+port);
