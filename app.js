require('dotenv').load()
var express = require('express')
var request = require('request')
var path = require('path')
var session = require('express-session')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var format = require('util').format
var Multer = require('multer')
var multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // no larger than 10mb
  }
})

var app = express()
app.use(favicon(__dirname + '/public/favicon.ico'))
module.exports = app

const socketio = app.listen(5089)

//add function for getModel
function getModel () {
  return require(`./model-${require('/srv/nimbusflightio/config.js').get('DATA_BACKEND')}`);
}
//for image uploading
function getPublicUrl (filename) {
  return 'https://storage.googleapis.com/nimbus-1485719300231.appspot.com/${filename}'
}
function sendUploadToGCS (req, res, next) {
  var userID = req.session.userID
  if (!req.files) {
    return next()
  }
  for (index = 0; index < req.files.length; ++index) {
    var gcsname = userID + '_' + req.files[index].originalname
    const file = bucket.file(gcsname)

    const stream = file.createWriteStream({
      metadata: {
        contentType: req.files[index].mimetype
      }
    })

    stream.on('error', (err) => {
      req.files[index].cloudStorageError = err
      next(err)
    })

    stream.on('finish', () => {
      socketio.emit('a')
      next()
    })

    stream.end(req.files[index].buffer)
  }
}
//for image uploading
function sendUploadToGCS (req, res, next) {
  var userID = req.session.userID
  if (!req.files) {
    return next()
  }
  for (index = 0; index < req.files.length; ++index) {
    var gcsname = userID + '_' + req.files[index].originalname
    const file = bucket.file(gcsname)

    const stream = file.createWriteStream({
      metadata: {
        contentType: req.files[index].mimetype
      }
    })

    stream.on('error', (err) => {
      //dont uncomment this it will throw an error
      //req.files[index].cloudStorageError = err
      next(err)
    })

    stream.on('finish', () => {
      socketio.emit('a')
      next()
    })

    stream.end(req.files[index].buffer)
  }
}

//configure Firebase Admin SDK
var admin = require("firebase-admin")
var serviceAccount = require("./serviceAccountKey.json")
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://nimbus-1485719300231.firebaseio.com"
});

//configure Firebase SDK
var firebase = require('firebase')
var firebaseCFG = firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
})

// create Firebase database instance
var firebaseDB = firebaseCFG.database()

//setting up view engine: pug
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

//set cookie for 2 days
app.use(session({ secret: 'more secure than keyboard cat', cookie: {maxAge: 60000*60*48 }}))

// user statistics
app.get('/statistics', function(req,res,next) {
  var textArray = ['Click here to see users currently logged in','Click here to see signed-up users'] 
  res.render('statistics', { title: 'Statistics | Nimbus', textArray: textArray})
})

app.get('/statistics/online-now', function(req,res,next) {
  res.write('Currently logged in users:')
  firebaseDB.ref('Online Now').once('value').then(function (snapshot) {
  snapshot.forEach(function (childSnap) {
  res.write('User\'s e-mail address: '+childSnapshot.val())
  })})
  res.end()
})

app.get('/statistics/all-users', function (req,res,next) {
  firebaseDB.ref('users').once('value').then(function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      res.write('User\'s e-mail address: '+childSnapshot.val())
    })
    res.end()
  })
})

// public area

app.get('/', function(req, res, next) {
  if (req.session.userID) {
    res.redirect('/flight-planning')
  } else {
    res.render('index', { title: 'Nimbus Flight: Drone Mapping and Image Processing Platform' })
  }
})

app.get('/sign-in', function(req,res,next) {
  res.render('sign-in', { title: 'Sign In | Nimbus' })
})

app.get('/sign-up', function(req,res,next) {
  res.render('sign-up', { title: 'Sign Up | Nimbus' })
})

// gateway - authentication handler
app.post('/auth', function(req,res,next){
var token = req.body.token
  admin.auth().verifyIdToken(token)
    .then(function(decodedToken) {
      res.send({userID: decodedToken.uid})
    }).catch(function(error) {
      console.log(error.message)
    })
})

// private area
app.get('/forum', function(req,res,next) {
  if (req.session.userID) {
    res.render('forum', { title: 'Forum | Nimbus' })
  } else {
    res.render('sign-in')
  }
})

app.get('/home', function(req,res,next) {
  if (req.session.userID) {
    res.render('home', { title: 'Home | Nimbus', subscriptionPlan: req.session.subscriptionPlan})
  } else {
    res.render('sign-in')
  }
})

app.get('/support', function(req,res,next) {
  if (req.session.userID) {
    res.render('support', { title: 'Support | Nimbus' })
  } else {
    res.render('sign-in')
  }
})

app.get('/get-user-ID', function(req,res,next) {
  if (req.session.userID) {
    res.send({userID: req.session.userID, source: req.session.source, industry: req.session.industry})
  }
})

app.get('/settings', function(req,res,next) {
  if (req.session.userID) {
    res.render('settings', { title: 'Settings | Nimbus', firstname: req.session.firstname, lastname: req.session.lastname, email: req.session.email, company: req.session.company, phone: req.session.phone, subscriptionPlan: req.session.subscriptionPlan})
  } else {
    res.render('sign-in')
  }
})

app.get('/get-images-from-cloud', function(req,res,next) {
  if (req.session.userID) {
    var userID = req.session.userID
    request('https://nimbus-1485719300231.appspot.com.storage.googleapis.com/?prefix='+userID, function (error, response, body) {
      res.send(response.body)
    })
  } else {
    res.render('sign-in')
  }
})

app.get('/flight-planning', function (req,res,next) {
  if (req.session.userID) {
    res.render('flight-planning', { title: 'Flight Planning | Nimbus', subscriptionPlan: req.session.subscriptionPlan})
  } else {
    res.render('sign-in')
  }
})

app.get('/model-creation', function (req,res,next) {
  if (req.session.userID) {
    res.render('model-creation', { title: 'Model Creation | Nimbus', subscriptionPlan: req.session.subscriptionPlan})
  } else {
    res.render('sign-in')
  }
})

app.get('/log-out', function(req,res,next) {
  req.session.destroy()
  res.redirect('/')
})

app.post('/members-area', function(req, res, next) {
  req.session.userID = req.body.userID
  req.session.firstname = req.body.firstname
  req.session.lastname = req.body.lastname
  req.session.company = req.body.company
  req.session.phone = req.body.phone
  req.session.subscriptionPlan = req.body.subscriptionPlan
  req.session.industry = req.body.industry
  req.session.source = req.body.source
  req.session.email = req.body.email
  res.redirect('/')
})

app.post('/upload-image', multer.array('image'), sendUploadToGCS, (req, res, next) => {
  let data = req.body
  if (req.files && req.files.cloudStoragePublicUrl) {
    data.imageUrl = req.files.cloudStoragePublicUrl
  }
  getModel().create(data, (err, savedData) => {
    if (err) {
      next(err)
      return
    }
 })
    res.redirect('/model-creation')
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
})
