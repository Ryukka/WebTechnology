import express = require('express')
import { MetricsHandler, Metric } from './metrics'
import path = require('path')
import bodyparser = require('body-parser')
import session = require('express-session')
import levelSession = require('level-session-store')
import { UserHandler, User } from './user'

const app = express()
const port: string = process.env.PORT || '8080'
app.use(express.static(path.join(__dirname, '/../public')))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded())


app.set('views', __dirname + "/../views")
app.set('view engine', 'ejs');

app.listen(port, (err: Error) => {
  if (err) throw err
  console.log(`Server is running on http://localhost:${port}`)
})


const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')


const LevelStore = levelSession(session)  // login part

app.use(session({
  secret: 'my very secret phrase',
  store: new LevelStore('./db/sessions'),
  resave: true,
  saveUninitialized: true
}))

const dbUser: UserHandler = new UserHandler('./db/users')
const authRouter = express.Router()

authRouter.get('/login', (req: any, res: any) => {
  res.render('login')
})

authRouter.get('/signup', (req: any, res: any) => {
  res.render('signup')
})

authRouter.get('/logout', (req: any, res: any) => {
  delete req.session.loggedIn
  delete req.session.user
  res.redirect('/login')
})

app.post('/login', (req: any, res: any, next: any) => {
  dbUser.get(req.body.username, (err: Error | null, result?: User) => {
    if (err) next(err)
    if (result === undefined || !result.validatePassword(req.body.password)) {
      res.redirect('/login')
    } else {
      req.session.loggedIn = true
      req.session.user = result
      res.redirect('/')
    }
  })
})






const userRouter = express.Router()    // signup part

app.post('/signup', (req: any, res: any, next: any) => {        //create an user
  dbUser.get(req.body.username, function (err: Error | null, result?: User) {
    //if (err) {
    //res.status(409).send("user already exists")
    //} else {
    var user: User = new User(req.body.username, req.body.password, req.body.email)
    dbUser.save(user, function (err: Error | null) {
      if (err) next(err)

      else {
        //alert('user created')
        res.redirect('/login')
      }
    })
  })
})


userRouter.get('/:username', (req: any, res: any, next: any) => {
  dbUser.get(req.params.username, function (err: Error | null, result?: User) {
    if (err || result === undefined) {
      res.status(404).send("user not found")
    } else res.status(200).json(result)
  })
})





const authCheck = function (req: any, res: any, next: any) {
  if (req.session.loggedIn) {
    next()
  } else res.redirect('/login')
}

app.get('/', authCheck, (req: any, res: any) => {
  res.render('index', { name: req.session.user.username })
})


//Metrics part
app.get('/add', (req: any, res: any) => {
  res.render('addMetrics')
})

app.get('/add', (req: any, res: any) => {
  dbMet.get(req.session.user.username, (err: Error | null, result?: any) => {
    if (err) throw err
    res.json(result)
  })
})

app.post('/add', (req: any, res: any) => {
  var metrics: Metric[] = []
  var metric: Metric = new Metric(req.body.timestamp, req.body.value)
  metrics.push(metric)
  dbMet.save(req.session.user.username, metrics, (err: Error | null) => {
    if (err) throw err

    res.redirect('/')
  })
})




//show metrics  
//Uses of key = req.session.user.username is to make sure that the metrics taken are only the user's
app.get('/show', (req: any, res: any) => {
  var metrics: Metric[] = []
  dbMet.get(req.session.user.username, (err: Error | null, result?: any) => {
    if (err) throw err
    res.json(result)
    metrics.push(result)
  })
  res.render('showMetrics', { metrics: metrics })
})


//end of metrics part
app.use(authRouter)
app.use('/user', userRouter)