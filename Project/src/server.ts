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
  dbUser.get(req.body.username, req.body.password, req.body.email, (err: Error | null, result?: User) => {
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

app.use(authRouter)


const userRouter = express.Router()    // signup part

app.post('/signup', (req: any, res: any, next: any) => {        //create an user
    dbUser.get(req.body.username, req.body.password,req.body.email, function (err: Error | null, result?: User) {
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
    dbUser.get(req.params.username,req.params.password,req.params.email, function (err: Error | null, result?: User) {
      if (err || result === undefined) {
        res.status(404).send("user not found")
      } else res.redirect('/metrics/add')
    })
})

app.use('/user', userRouter)


const dbMet: MetricsHandler = new MetricsHandler('./db/metrics') // metrics part
const metricsRouter = express.Router()

metricsRouter.get('/add', (req: any, res: any) => { 
  res.render('addMetrics')
})

metricsRouter.post('/add'),(req: any, res: any) =>{
  var metric: Metric = new Metric(req.session.user.username,req.body.timestamp,req.body.value)
  dbMet.save(metric, function(err:Error|null){
          alert('metric added')
          res.redirect('/add')
        
  })
}

metricsRouter.use('/user/metrics',metricsRouter)

const authCheck = function (req: any, res: any, next: any) {
  if (req.session.loggedIn) {
    next()
  } else res.redirect('/login')
}

app.get('/', authCheck, (req: any, res: any) => {
  res.render('index', { name: req.session.username })
})