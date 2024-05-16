const exp = require('constants')
const express = require('express');
const { getDefaultAutoSelectFamily } = require('net');
const path = require('path')


const app  = express()
const server = require('http').createServer(app);
const io =  require('socket.io')(server);

app.use(express.static(path.join(__dirname, './../Client/')));
app.set('views', path.join(__dirname, './../Client/'));
app.engine('html' , require('ejs').renderFile);
app.set('view engine', 'html');


app.use('/', (req, res) => {
    var path = req._parsedOriginalUrl.pathname 

    if(path === '/lobbys/'){
        res.render('lobbys.html')
    }else if(path.includes('/game/')){
        res.render('jogo.html')
    }else{
        res.render('index.html')
    }
})



io.on('connection', socket => {
    socket.emit('serverOn', socket.id)
   

   
})


server.listen(3000)