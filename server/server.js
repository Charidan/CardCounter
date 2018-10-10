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
              let game = new Game();
              game.name = (req.body.name ? req.body.name : ('Game'+(ret+1)));
              game.save((err, prod) => err ? fail(err, res) : res.json(prod));
          })
      });

// POST clone game (ostensibly from template)
router.post('/game/clone/', (req, res) => {
    Game.findOne({_id: mongoose.Types.ObjectId(req.body.gameid)}).populate('decks').exec((err,game) =>
    {
        if(err) { fail(err, res); return; }
        if(game == null)
        {
            fail("ERROR: attempt to clone non-existant game with id = " + req.body.gameid, res);
            return;
        }

        game._id = mongoose.Types.ObjectId();
        game.isNew = true;
        game.isTemplate = false;

        game.save(function(err, prod) {
            if(err)
            {
                fail(err, res);
                return;
            }

            Deck.find({gameid: mongoose.Types.ObjectId(req.body.gameid)}).exec(function(err, decks)
            {
                console.log(mongoose.Types.ObjectId(req.body.gameid));
                for(let i = 0; i < decks.length; i++)
                {
                    decks[i]._id = mongoose.Types.ObjectId();
                    decks[i].gameid = prod._id;
                    decks[i].isNew = true;

                    for(let c = 0; c < decks[i].cards.length; c++)
                    {
                        // TODO is this needed?
                        decks[i].cards[c]._id = mongoose.Types.ObjectId();
                    }

                    decks[i].save((err) => err ? fail(err, res) : null);
                }

                res.json(prod);
            });
        });
    });
});

// POST set game as template (or not)
router.post('/game/:gameid/setTemplate', (req, res) => {
    Game.findOne({_id: mongoose.Types.ObjectId(req.params.gameid)}).populate('decks').exec((err,game) =>
    {
        if(err) { fail(err, res); return; }
        if(game == null)
        {
            fail("ERROR: attempt to set template status of non-existant game with id = " + req.params.gameid, res);
            return;
        }

        game.isTemplate = req.body.isTemplate;

        game.save((err, prod) => err ? fail(err, res) : res.json(prod));
    });
});

// GET list all decks (across games)
// POST create deck
router.route('/decks')
      .get((req, res) => { Deck.find().exec((err,ret) => (err ? fail(err) : res.json(ret))) })
      .post((req, res) => {
          createDeckAndSave((err, prod) => err ? fail(err, res) : res.json(prod), req.body.gameid, req.body.name, req.body.rangeMin, req.body.rangeMax);
      });

let createDeck = function(callback, gameid, name, rangeMin, rangeMax)
{
    let game = Game.findOne({_id: mongoose.Types.ObjectId(gameid)});
    if(game == null)
    {
        fail("ERROR: attempt to create deck for non-existant gameid", res);
        return;
    }

    Deck.count().exec((err, ret) =>
    {
        if(err)
        {
            callback("err");
            return;
        }
        let deck = new Deck({
            name: (name ? name : ('Deck' + (ret+1))),
            gameid: mongoose.Types.ObjectId(gameid),

            // deck settings
            showCardsLocked: false,
            showCardsEditing: false,
            transferTargetsDrawn: [],
            transferTargetsAny: [],

            // legal actions
            legalDraw: false,
            legalShuffle: false,
            legalDestroy: false,
            legalPutOnBottom: false,
            legalAcceptTransfer: false,
            legalPerformTransferDrawn: false,
            legalPerformTransferAny: false,
        });

        if(rangeMin != null && rangeMax != null)
        {
            rangeMin = parseInt(rangeMin);
            rangeMax = parseInt(rangeMax);
            if(!( isNaN(rangeMin) && isNaN(rangeMax) ))
            {
                for(let i = rangeMin; i <= rangeMax; i++)
                {
                    let card = new Card({_id: mongoose.Types.ObjectId(), value: i});
                    deck.putOnBottom(card);
                }
            }
        }

        if(callback != null) callback(deck);
    });
};

let createDeckAndSave = function(callback, gameid, name, rangeMin, rangeMax)
{
    createDeck(function(ret)
    {
        if(ret === "err")
        {
            fail(err, res);
            return;
        }
        ret.markModified('cards');
        return ret.save(function(err, prod) { if(callback != null) callback(err, prod); });
    }, gameid, name, rangeMin, rangeMax);
};

// GET list decks of specified gameid
router.get('/decks/:gameid', (req,res) => { Deck.find({gameid: mongoose.Types.ObjectId(req.params.gameid)}).exec((err, ret) => (err ? fail(err) : res.json(ret))) });

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
        deck.save((err, prod) => err ? fail(err, res) : res.json(prod));
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
        deck.save((err, prod) => err ? fail(err, res) : res.json([card, prod]));
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
        deck.save((err, prod) => err ? fail(err, res) : res.json(prod));
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

        let card = new Card({_id: mongoose.Types.ObjectId(), value: req.body.value, deckid: req.params.deckid});

        deck.putOnBottom(card);
        deck.markModified('cards');
        deck.save((err, prod) => err ? fail(err, res) : res.json(prod));
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
        deck.save((err, prod) => err ? fail(err, res) : res.json(prod));
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
                deck.cards.splice(i, 1);
                deck.markModified('cards');
                deck.save((err, prod) => err ? fail(err, res) : res.json(prod));
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
        deck.save((err, prod) => err ? fail(err, res) : res.json(prod));
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

        deck.save((err, prod) => err ? fail(err, res) : res.json(prod));
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
            deck.save((err, prod) => err ? fail(err, res) : res.json(prod));
        });
    });

// POST set list of targets for deck transfer
router.post('/deck/:deckid/setTargets/', (req, res) => {
    Deck.findOne({_id: mongoose.Types.ObjectId(req.params.deckid)}).exec((err, deck) =>
    {
        if(err)
        {
            fail(err, res);
            return;
        }

        if(deck == null)
        {
            fail("ERROR: attempt to set transfer targets of a non-existant deck", res);
            return;
        }

        if(req.body.drawnOrAny)
        {
            deck.transferTargetsDrawn = req.body.targetDecks;
            deck.markModified('transferTargetsDrawn');
        }
        else
        {
            deck.transferTargetsAny = req.body.targetDecks;
            deck.markModified('transferTargetsAny');
        }

        deck.save((err, prod) => err ? fail(err, res) : res.json(prod));
    });
});

/////////////////////////////////////////////////////////

// initialize Gloomhaven template in new DB
let gloomid = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
Game.findById(gloomid, function(err, game) {
    if(game == null)
    {
        let gloom = new Game({_id: gloomid, name: "Gloomhaven", isTemplate: true});
        gloom.save(function(err, game)
        {
            let shuffleAndSave = function(deck)
            {
                deck.legalDraw = true;
                deck.legalDestroy = true;
                deck.legalPutOnBottom = true;

                deck.shuffle();
                deck.markModified('cards');
                deck.save();
            };
            createDeck(shuffleAndSave, game._id, "City", 1, 30);
            createDeck(shuffleAndSave, game._id, "Road", 1, 30);
            createDeck(function(shop)
            {
                shop._id = mongoose.Types.ObjectId();

                for(let i = 1; i <= 14; i++)
                {
                    let card = new Card({value: i, _id: mongoose.Types.ObjectId()});
                    if(i >= 12)
                    {
                        shop.putOnBottom(card);
                        card = new Card({value: i, _id: mongoose.Types.ObjectId()});
                        shop.putOnBottom(card);
                        card = new Card({value: i, _id: mongoose.Types.ObjectId()});
                    }
                    shop.putOnBottom(card);
                    card = new Card({value: i, _id: mongoose.Types.ObjectId()});
                    shop.putOnBottom(card);
                }

                shop.showCardsLocked = true;
                shop.legalAcceptTransfer = true;
                shop.legalPerformTransferAny = true;

                let playerRefs = [];
                for(let i = 1; i < 5; i++)
                {
                    playerRefs.push( { name: "Player " + i, deckid: mongoose.Types.ObjectId() } );
                }

                shop.transferTargetsAny = playerRefs;

                shop.markModified('cards');
                shop.markModified('transferTargetsAny');
                shop.save();

                // Create player inventories and link transfer to the shop bidirectionally
                let playerCallback = function(deckid, player)
                {
                    player._id = deckid;

                    player.showCardsLocked = true;
                    player.legalAcceptTransfer = true;
                    player.legalPerformTransferAny = true;
                    player.transferTargetsAny = [{name: shop.name, deckid: shop._id}];

                    player.markModified('transferTargetsAny');
                    player.save();
                };

                for(let i = 0; i < 4; i++)
                {
                    createDeck(playerCallback.bind(null, playerRefs[i].deckid), game._id, playerRefs[i].name);
                }

            }, game._id, "Store");
        });
    }
});

server.use('/cardcounter', router);
const port = process.env.PORT || 2837;
server.listen(port);
console.log("CardCounter Server running on port "+port);
