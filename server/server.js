var express     = require('express');
var server      = express();
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
mongoose.connect('mongodb://localhost:27017/terkes', {
    useMongoClient: true,
});

//MODELS ///////////////////////////////////////////////
var Language = require('./models/language').Language;
var Phoneme = require('./models/phoneme').Phoneme;
var Consonant = require('./models/phoneme').Consonant;
var Vowel = require('./models/phoneme').Vowel;
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
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
    next();
});

var router = express.Router();

//ROUTES ////////////////////////////////////////////////
router.use((req, res, next) => {
    // permission check goes here
    // return without calling next() to deny

    next(); // permission granted
});

var about = (req, res) => { res.json({name: 'language-generator-server', displayName: 'Test Page by Richard Nicholson', version: '0.0.1'})}
router.get('/', about);
router.get('/about', about);
router.route('/languages')
      .get((req, res) => { Language.find().exec((err,ret) => (err ? fail(err) : res.json(ret))) })
      .post((req, res) => {
          Language.count().exec((err, ret) => {
              if(err) { fail(err, ret); return; }
              var id = ret + 1;
              var language = new Language();
              language.name = (req.body.name ? req.body.name : ('Language'+id));
              language.id = id;
              language.save((err) => err ? fail(err, res) : res.json(language))
          })
      });

router.route('/phonemes')
      .get((req, res) => { Phoneme.find().exec((err,ret) => (err ? fail(err) : res.json(ret))) })
      .post((req, res) => {
          Phoneme.count().exec((err, ret) => {
              if(err) { fail(err, ret); return; }
              var id = ret + 1;
              if(req.body.kind !== 'Consonant' && req.body.kind !== 'Vowel')
              {
                  fail("Server: Cannot create Phoneme: Phoneme is neither Consonant nor Vowel. Value = " + String(req.body.kind), ret);
                  return;
              }
              var phoneme;

              if(req.body.kind === 'Vowel')
              {
                  phoneme = new Vowel({
                      long: req.body.long,
                      nasal: req.body.nasal,

                      front: req.body.front,
                      back: req.body.back,
                      high: req.body.high,
                      low: req.body.low,
                      tense: req.body.tense,
                      rounded: req.body.rounded,
                  });
              }
              else
              {
                  phoneme = new Consonant({
                      long: req.body.long,
                      nasal: req.body.nasal,

                      place: req.body.place,
                      manner: req.body.manner,

                      aspirated: req.body.aspirated,
                      ejective: req.body.ejective,
                      lateral: req.body.lateral,
                      retroflex: req.body.retroflex,
                      sibilant: req.body.sibilant,
                      voiced: req.body.voiced,
                  });
              }
              phoneme.id = id;
              phoneme.save((err) => err ? fail(err, res) : res.json(phoneme))
          })
      });

/////////////////////////////////////////////////////////

server.use('/langgen', router);
var port = process.env.PORT || 2837
server.listen(port);
console.log("LangGenServer running on port "+port);