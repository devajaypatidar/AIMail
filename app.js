const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: 'oh my little dirty secret',
  resave: false,
  saveUninitialized: true,

}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("Successfully connect to MongoDB."))
  .catch(err => console.error("Connection error", err));

  const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
  })

  UserSchema.plugin(passportLocalMongoose);

  
const User = mongoose.model("User", UserSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
  // where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.get('/',(req,res) => {
  res.sendFile(__dirname+"/index.html");
})


app.get('/mail',(req, res) => {
    res.render('mailgenerator');
})



app.post('/mail',(req, res) => {
  const prompt = "write a mail to "+ req.body.mailTo+ " for "+ req.body.for;
  (async () => {

    try{
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            temperature: 0,
            max_tokens: 900,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          });
          const mail = response.data.choices[0].text.split(/\n/);
          console.log(response);
          res.render('mail',{mail: mail});

    }catch(error){
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
          } else {
            console.log(error.message);
          }

          res.render('error')
    }
    
})();


})





// how to reply request

app.get('/howtoreply',(req, res) => {
  res.render('reply');
})

app.post('/howtoreply',(req, res) => {
  const prompt = "please tell me how to reply to my "+ req.body.replyto+ " his message is "+ req.body.message+ " this and i want to reply this "+ req.body.thoughts+ " please show me some good ways to reply ";
     (async () => {

        try{
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: prompt,
                temperature: 0,
                max_tokens: 900,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
              });
              
              const result = response.data.choices[0].text.split(/\n/);
          
              res.render('howtoreplyresult',{mail: result});
    
        }catch(error){
            if (error.response) {
                console.log(error.response.status);
                console.log(error.response.data);
              } else {
                console.log(error.message);
              }
              res.render('error')
        }
        
    })();
    
    
})

app.get('/login', function (req, res) {
  res.render('login');
})

app.get('/register',function(req, res){
  res.render('register');
})


//login and register post routes
app.post('/register', (req, res) => {
  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect('/register');
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      })
    }
  });

});

app.post('/login', (req, res) => {

  const user = new User({
    email: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.redirect("/")
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      })
    }
  })

});

app.get('/about', function (req, res) {
  res.render('about');
})



app.post('/contactform',function (req,res){
  res.redirect('/');
})

app.post('/newsletter',function (req,res){
  res.redirect('/');
})

let port = process.env.PORT || 80;

app.listen(port,function(){
  console.log("Server is Started succesfully");
})

