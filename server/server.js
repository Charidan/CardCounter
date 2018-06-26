var express     = require('express');
var server      = express();
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
mongoose.connect('mongodb://localhost:27017/cardcounter', {
    useMongoClient: true,
});

//MODELS ///////////////////////////////////////////////
var Game = require('./models/game').Game;
////////////////////////////////////////////////////////

//Utilities ////////////////////////////////////////////
var fail = (err_msg,res) => {
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

var router = express.Router();

//ROUTES ////////////////////////////////////////////////
router.use((req, res, next) => {
    // permission check goes here
    // return without calling next() to deny

    next(); // permission granted
});

var about = (req, res) => { res.json({name: 'card-counter-server', displayName: 'About Page by Richard Nicholson', version: '0.0.1'})}
router.get('/', about);
router.get('/about', about);
router.route('/games')
      .get((req, res) => { Game.find().exec((err,ret) => (err ? fail(err) : res.json(ret))) })
      .post((req, res) => {
          Game.count().exec((err, ret) => {
              if(err) { fail(err, ret); return; }
              var id = ret + 1;
              var game = new Game();
              game.name = (req.body.name ? req.body.name : ('Game'+id));
              game.id = id;
              game.save((err) => err ? fail(err, res) : res.json(game))
          })
      });

/////////////////////////////////////////////////////////

server.use('/cardcounter', router);
var port = process.env.PORT || 2837
server.listen(port);
console.log("CardCounter Server running on port "+port);