express = require('express')
metrics = require('./metrics')
app = express()

app.get('/metrics.json', (req, res) => {
  metrics.get((err, data) => {
    if(err) throw err
    res.status(200).json(data)
  })
})

app.set('port', 1337)
path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

app.set('views', __dirname + "/views")
app.set('view engine', 'ejs');

app.get(
    '/hello/:name', 
    (req, res) => res.render('hello.ejs', {name: req.params.name})
)



app.listen(
  app.get('port'), 
  () => console.log(`server listening on ${app.get('port')}`)
)