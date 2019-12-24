express = require('express')
metrics = require('./metrics')
app = express()
app.set('port', 1337)


app.set('views', __dirname + "/views")
app.set('view engine', 'ejs');

app.get(
    '/hello/:name', 
    (req, res) => {if((req.params.name) =='yven'){
        res.render(res.render('description.ejs', {name: req.params.name}))
    }
    else{res.render('hello.ejs', {name: req.params.name})
    }
})

app.get('/metrics.json', (req, res) => {
    metrics.get((err, data) => {
      if(err) throw err
      res.status(200).json(data)
    })
})

path = require('path')
app.use(express.static(path.join(__dirname, 'public')))


app.listen(
    app.get('port'), 
    () => console.log(`server listening on ${app.get('port')}`)
  )