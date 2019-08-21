const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/mydb";
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const hostURL = 'localhost:6000/';
const app = express();

//promise
mongoose.Promise = global.Promise;
const keys = require('./config/keys');

//connet to mongoose
mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true
})
    .then(() => console.log('Mongo is connected'))
    .catch(err => console.log(err));


    //body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());


//load ideamodel
require('./models/urls');
require('./models/persons');
require('./models/words');



const Word = mongoose.model('words');
const Url = mongoose.model('urls');
const Person = mongoose.model('persons');

//


//set storage engiene
const storage = multer.diskStorage({
    destination: './public/uploads/',
   
    filename: function (req, file, cb) {
        cb(null, file.originalname);
        // cb(null,file.originalname+ '-' + Date.now() + path.extname(file.originalname));

    }
});

//init upload
const upload = multer({
    storage: storage
}).single('myFile');


//starts ejs
app.set('view engine', 'ejs');

app.use("/public", express.static(path.join(__dirname, 'public')));
app.use("/views", express.static(path.join(__dirname, 'views')));

app.use(express.static("./views"));




app.get('/', (req, res) => {

    
        res.render('index', { });

});


app.post('/upload', (req, res) => {
    try {
        upload(req, res, (err) => {
            if (err) {
                console.log("err");
    
                console.log(err);
    
                res.render('index', {
                    msg: err
                    
                });
    
            } else {
                if (req.file == undefined) {
                    console.log(req.file);
    
                    res.render('index', {
                        msg: 'Error no file selected'
                    });
                } else {
                    console.log("the fuck?");
    
                    const newUser={
                        title: req.file.filename,
                        //details: req.body.details
    
                    }
                    new Idea(newUser)
                        .save()
    
                    Idea.find({}, (err, ideas) => {
                        if (err) return console.log(err);
                
                        res.writeHead(301,
                            {Location: hostURL}
                          );
                        res.end();
                    });
                   
    
    
                }
            }
        })
    } catch (error) {
        console.log(error);
    }
   
});



//for downloads
app.post('/download', function (req, res) {
    try {
        
        let file = __dirname + '/public/uploads/'+req.body.title;
        console.log(file);
        res.download(file); // Set disposition and send it.
    } catch (error) {
        
    }
    
});



app.get('/english', function (req, res) {
   
        res.render('english', { 
            Numberofwords: 0
        });
 
});



app.post('/addNewURL', async function (req, res) {
    // const newUrl={
    //     url: req.body.newURL,
    //     notes: req.body.newNote,
    //     categorie: req.body.newCategorie
        
    // }
    // new Url(newUrl)
    //     .save()

    // Url.find({}, (err, urls) => {
    //     if (err) return console.log(err);

    //     res.writeHead(301,
    //         {Location: hostURL+'savedURLs'}
    //       );
    //     res.end();
    // });                              https://www.myenglishpages.com/site_php_files/vocabulary-lesson-function-words.php

    var sentence = req.body.newURL;
    console.log(sentence);

    var words = sentence.split(" ");

    
 


    var partsOfSpeech = [];
    var sentenceSubject = "";
    var sentenceVerb ="";
    var sentenceObject ="";
    var predicate = ""; //everything after the subject
    
    var mainActors=[] // of a sentence or paragraph;
    var mainEvents=[]; // in a sentence or paragraph;
    var clauses=[]; // clauses of a compound sentence;

    var possessives=[]; //if a possesive pronoun or 's add to list owner::item

    for (var i =0;i<words.length;i++){
        //Subject pronouns
        if (words[i] == "I" || words[i] == "i"){ partsOfSpeech.push("Pronoun FirstPerson Subject"); sentenceSubject = words[i]};
        if (words[i] == "We" || words[i] == "we"){ partsOfSpeech.push("Pronoun FirstPerson Subject"); sentenceSubject = words[i]};
        if (words[i] == "You" || words[i] == "you"){ partsOfSpeech.push("Pronoun SecondPerson"); if(sentenceSubject==""){sentenceSubject = words[i]}else{sentenceObject = words[i]; }};
        if (words[i] == "He" || words[i] == "he"){ partsOfSpeech.push("Pronoun ThirdPerson Subject"); sentenceSubject = words[i]};
        if (words[i] == "She" || words[i] == "she"){ partsOfSpeech.push("Pronoun FirstPerson Subject"); sentenceSubject = words[i]};
        if (words[i] == "They" || words[i] == "they"){ partsOfSpeech.push("Pronoun FirstPerson Subject"); sentenceSubject = words[i]};

        //Object Pronouns
        if (words[i] == "Me" || words[i] == "me"){ partsOfSpeech.push("Pronoun FirstPerson Object"); sentenceObject = words[i];};
        if (words[i] == "Him" || words[i] == "him"){ partsOfSpeech.push("Pronoun ThirdPerson Object"); sentenceObject = words[i];};
        if (words[i] == "Her" || words[i] == "her"){ partsOfSpeech.push("Pronoun ThirdPerson Object");sentenceObject = words[i];};
        if (words[i] == "It" || words[i] == "it"){ partsOfSpeech.push("Pronoun ThirdPerson")};
        if (words[i] == "Us" || words[i] == "us"){ partsOfSpeech.push("Pronoun FirstPerson Object");sentenceObject = words[i];};
        if (words[i] == "Them" || words[i] == "them"){ partsOfSpeech.push("Pronoun ThirdPerson Object");sentenceObject = words[i];};

        //Possessive Adjectives
        if (words[i] == "My" || words[i] == "my"){ partsOfSpeech.push("Possessive Adjectives"); possessives.push(words[i]+' '+words[i+1]);};
        if (words[i] == "Your" || words[i] == "your"){ partsOfSpeech.push("Possessive Adjectives"); possessives.push(words[i]+' '+words[i+1]);};
        if (words[i] == "His" || words[i] == "his"){ partsOfSpeech.push("Possessive Adjectives"); possessives.push(words[i]+' '+words[i+1]);};
        if (words[i] == "Her" || words[i] == "her"){ partsOfSpeech.push("Possessive Adjectives"); possessives.push(words[i]+' '+words[i+1]);};
        if (words[i] == "Its" || words[i] == "its"){ partsOfSpeech.push("Possessive Adjectives"); possessives.push(words[i]+' '+words[i+1]);};
        if (words[i] == "Our" || words[i] == "our"){ partsOfSpeech.push("Possessive Adjectives"); possessives.push(words[i]+' '+words[i+1]);};
        if (words[i] == "Their" || words[i] == "Theirs"){ partsOfSpeech.push("Possessive Adjectives"); possessives.push(words[i]+' '+words[i+1]);};

        //Possessive Pronouns
        if (words[i] == "Mine" || words[i] == "mine"){ partsOfSpeech.push("Pronoun Possessive"); possessives.push(words[i]+' '+words[i+1]);};
        if (words[i] == "Yours" || words[i] == "yours"){ partsOfSpeech.push("Pronoun Possessive"); possessives.push(words[i]+' '+words[i+1]);};
        if (words[i] == "Hers" || words[i] == "hers"){ partsOfSpeech.push("Pronoun Possessive"); possessives.push(words[i]+' '+words[i+1]);};
        if (words[i] == "Ours" || words[i] == "ours"){ partsOfSpeech.push("Pronoun Possessive"); possessives.push(words[i]+' '+words[i+1]);};
        if (words[i] == "Theirs" || words[i] == "Theirs"){ partsOfSpeech.push("Pronoun Possessive"); possessives.push(words[i]+' '+words[i+1]);};

        //Reflexive Pronouns
        if (words[i] == "Myself" || words[i] == "Myself"){ partsOfSpeech.push("Pronoun Possessive");};
        if (words[i] == "Yourself" || words[i] == "yourself"){ partsOfSpeech.push("Pronoun Possessive");};
        if (words[i] == "itself" || words[i] == "itself"){ partsOfSpeech.push("Pronoun Possessive");};
        if (words[i] == "Herself" || words[i] == "herself"){ partsOfSpeech.push("Pronoun Possessive");};
        if (words[i] == "Ourselves" || words[i] == "ourselves"){ partsOfSpeech.push("Pronoun Possessive");};
        if (words[i] == "Theirselves" || words[i] == "Theirselves"){ partsOfSpeech.push("Pronoun Possessive");};
        
        //the above is thake from https://7esl.com/english-pronouns/

        //Determiners
        if (words[i] == "The" || words[i] == "the"){ partsOfSpeech.push("Determiner Article");};
        if (words[i] == "A" || words[i] == "a"){ partsOfSpeech.push("Determiner Article");};
        if (words[i] == "When" || words[i] == "when"){ partsOfSpeech.push("Determiner Article");};
        if (words[i] == "An" || words[i] == "an"){ partsOfSpeech.push("Determiner Article");};
        if (words[i] == "Much" || words[i] == "much"){ partsOfSpeech.push("Determiner Quantifiers");};
        if (words[i] == "More" || words[i] == "More"){ partsOfSpeech.push("Determiner Quantifiers");};
        if (words[i] == "Some" || words[i] == "some"){ partsOfSpeech.push("Determiner Quantifiers");};
        if (words[i] == "Any" || words[i] == "any"){ partsOfSpeech.push("Determiner Quantifiers");};
        if (words[i] == "Enough" || words[i] == "enough"){ partsOfSpeech.push("Determiner Quantifiers");};
        if (words[i] == "The" || words[i] == "the"){ partsOfSpeech.push("Determiner Quantifiers");};
        //there are more determiners/ https://www.ef.com/wwen/english-resources/english-grammar/determiners/


        //Auxilary Verbs
        if (words[i] == "Am" || words[i] == "am"){ partsOfSpeech.push("Verb Auxilary Be");};
        if (words[i] == "Is" || words[i] == "is"){ partsOfSpeech.push("Verb Auxilary Be");};
        if (words[i] == "Are" || words[i] == "are"){ partsOfSpeech.push("Verb Auxilary Be");};
        if (words[i] == "Was" || words[i] == "was"){ partsOfSpeech.push("Verb Auxilary Be");};
        if (words[i] == "Were" || words[i] == "were"){ partsOfSpeech.push("Verb Auxilary Be");};
        if (words[i] == "Be" || words[i] == "be"){ partsOfSpeech.push("Verb Auxilary Be");};
        if (words[i] == "Been" || words[i] == "been"){ partsOfSpeech.push("Verb Auxilary Be");};

        if (words[i] == "Has" || words[i] == "has"){ partsOfSpeech.push("Verb Auxilary Have");};
        if (words[i] == "Have" || words[i] == "have"){ partsOfSpeech.push("Verb Auxilary Have");};
        if (words[i] == "Had" || words[i] == "had"){ partsOfSpeech.push("Verb Auxilary Have");};

        if (words[i] == "Do" || words[i] == "do"){ partsOfSpeech.push("Verb Auxilary Do");};
        if (words[i] == "Did" || words[i] == "did"){ partsOfSpeech.push("Verb Auxilary Do");};
        if (words[i] == "Does" || words[i] == "does"){ partsOfSpeech.push("Verb Auxilary Do");};

        if (words[i] == "Will" || words[i] == "will"){ partsOfSpeech.push("Verb Auxilary Future");};
        if (words[i] == "Shall" || words[i] == "shall"){ partsOfSpeech.push("Verb Auxilary Future");};

        if (words[i] == "Should" || words[i] == "should"){ partsOfSpeech.push("Verb Auxilary Conditional");};
        if (words[i] == "Could" || words[i] == "could"){ partsOfSpeech.push("Verb Auxilary Conditional");};
        if (words[i] == "Would" || words[i] == "would"){ partsOfSpeech.push("Verb Auxilary Conditional");};

        if (words[i] == "Can" || words[i] == "can"){ partsOfSpeech.push("Verb Auxilary Ability");};
        if (words[i] == "May" || words[i] == "may"){ partsOfSpeech.push("Verb Auxilary Permission");};
        if (words[i] == "Might" || words[i] == "might"){ partsOfSpeech.push("Verb Auxilary Possibility");};
        if (words[i] == "Must" || words[i] == "must"){ partsOfSpeech.push("Verb Auxilary Necessity");};
        
        //conjunctions when a conjuction is added the possibility of second SOV phrase is allowed
        if (words[i] == "For" || words[i] == "for"){ partsOfSpeech.push("Conjunction Coordinating");};
        if (words[i] == "Yet" || words[i] == "yet"){ partsOfSpeech.push("Conjunction Coordinating");};
        if (words[i] == "And" || words[i] == "and"){ partsOfSpeech.push("Conjunction Coordinating");};
        if (words[i] == "Nor" || words[i] == "nor"){ partsOfSpeech.push("Conjunction Coordinating");};
        if (words[i] == "But" || words[i] == "but"){ partsOfSpeech.push("Conjunction Coordinating");};
        if (words[i] == "Or" || words[i] == "or"){ partsOfSpeech.push("Conjunction Coordinating");};
        if (words[i] == "So" || words[i] == "so"){ partsOfSpeech.push("Conjunction Coordinating");};
        if (words[i] == "If" || words[i] == "if"){ partsOfSpeech.push("Conjunction");};
        if (words[i] == "Then" || words[i] == "then"){ partsOfSpeech.push("Conjunction");};

        
        //particles
        if (words[i] == "No" || words[i] == "no"){ partsOfSpeech.push("Particle Negating");}; //what is being negated?
        if (words[i] == "Not" || words[i] == "Not"){ partsOfSpeech.push("Particle Negating");}; // what is being negated?
       
        //prepositions
        if (words[i] == "Of" || words[i] == "of"){ partsOfSpeech.push("Preposition");};
        if (words[i] == "With" || words[i] == "with"){ partsOfSpeech.push("Preposition");};
        if (words[i] == "At" || words[i] == "at"){ partsOfSpeech.push("Preposition");};
        if (words[i] == "From" || words[i] == "from"){ partsOfSpeech.push("Preposition");};
        if (words[i] == "Into" || words[i] == "into"){ partsOfSpeech.push("Preposition");};
        if (words[i] == "During" || words[i] == "during"){ partsOfSpeech.push("Preposition");};
        if (words[i] == "Including" || words[i] == "including"){ partsOfSpeech.push("Preposition");};
        if (words[i] == "Until" || words[i] == "until"){ partsOfSpeech.push("Preposition");};
        if (words[i] == "Against" || words[i] == "against"){ partsOfSpeech.push("Preposition");};
        if (words[i] == "Among" || words[i] == "among"){ partsOfSpeech.push("Preposition");};
        if (words[i] == "Throughout" || words[i] == "throughout"){ partsOfSpeech.push("Preposition");};
        if (words[i] == "Despite" || words[i] == "despite"){ partsOfSpeech.push("Preposition");};
        if (words[i] == "Towards" || words[i] == "towards"){ partsOfSpeech.push("Preposition");};
        if (words[i] == "Upon" || words[i] == "upon"){ partsOfSpeech.push("Preposition");};
        if (words[i] == "Concerning" || words[i] == "concerning"){ partsOfSpeech.push("Preposition");};
        if (words[i] == "To" || words[i] == "to"){ partsOfSpeech.push("Preposition");};
        //there is way more prepositions than this https://www.talkenglish.com/vocabulary/top-50-prepositions.aspx


        //Question Words
        if (words[i] == "What" || words[i] == "what"){ partsOfSpeech.push("Question");};
        if (words[i] == "When" || words[i] == "when"){ partsOfSpeech.push("Question");};
        if (words[i] == "Why" || words[i] == "why"){ partsOfSpeech.push("Question");};
        if (words[i] == "Which" || words[i] == "which"){ partsOfSpeech.push("Question");};
        if (words[i] == "Who" || words[i] == "who"){ partsOfSpeech.push("Question");};
        if (words[i] == "How" || words[i] == "how"){ partsOfSpeech.push("Question");};
        if (words[i] == "Whose" || words[i] == "whose"){ partsOfSpeech.push("Question");};
        if (words[i] == "Whom" || words[i] == "whom"){ partsOfSpeech.push("Question");};



        //
        if(partsOfSpeech[i]==null){partsOfSpeech.push("Unknown");}       
    }


    for (let i = 0; i<words.length;i++){
        if(partsOfSpeech[i]=="Unknown"){
            var pos = "";
            await Word.findOne({word: words[i]},(err,word)=>{
                if(word != null){
                    console.log(word.partOfSpeech+2222222222222);
                    pos = word.partOfSpeech;
                    partsOfSpeech[i] = pos;
                    console.log(partsOfSpeech[i]+2222222222222);

                }
            })
        }
    }

  

    console.log("Number of words: "+words.length);
    console.log("Subject: "+sentenceSubject);
    console.log("Verb: "+sentenceVerb);
    console.log("Object: "+sentenceObject);
    for (let i = 0; i<words.length;i++){
        console.log(words[i]+": "+partsOfSpeech[i]);

    }

    res.render('english', { 
        Numberofwords: words.length,
        Subject: sentenceSubject,
        Verb: sentenceVerb,
        Object: sentenceObject,
        Words: words,
        Partsofspeech: partsOfSpeech
    });
});

app.get('/addWord', function (req, res) {
    res.render('addWord', { 
        
    });
   
});

app.post('/addNewWord', function (req, res) {
    

    var newWord={
        word: req.body.word,
        partOfSpeech: req.body.partOfSpeech,
        definition: req.body.definition,
        
    }
    console.log(newWord);

    new Word(newWord)
        .save();

    res.writeHead(301,
        {Location: hostURL+"addWord"}
        );
    res.end();

        

});



const port = 6660;

app.listen(port, () => console.log('server started on 6660'));
