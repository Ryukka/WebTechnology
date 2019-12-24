module.exports = {
    serverHandle = function (req, res) {
        const route = url.parse(req.url)
        const path = route.pathname 
        const params = qs.parse(route.query)
        console.log(path);
        console.log(params);
      
      
        res.writeHead(200, {'Content-Type': 'text/plain'});
        if (path === '/hello' && 'name' in params) {
          if ((params['name'])=== 'yven'){
            res.write('I, my name is Yven i\'m 21.')
          }
          else{
            res.write('hello ' + params['name'])
          }
        } else {
          res.write('error 404 message not found')
        }
        res.end();
      }
}

