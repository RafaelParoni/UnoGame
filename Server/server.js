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
    switch(path){
        case '/':
            res.render('index.html')
            break;
        case '/lobbys':
            res.render('lobbys.html')
            break;
        case '/game':
                res.render('jogo.html')
                break;
        default:
            res.render('index.html')
            break;
    }
})


let users = [];

let lobbys = [];

io.on('connection', socket => {
    socket.emit('serverOn', socket.id)
   

    socket.on('searchLobbys', function(data){
        console.log(data)
    })
    socket.on('clientOff', function(data){
        console.log(data)
    })
})


server.listen(3000)