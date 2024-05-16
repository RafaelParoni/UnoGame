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
        case '/lobbys/':
            res.render('lobbys.html')
            break;
        case '/game/':
                res.render('jogo.html')
                break;
        default:
            res.render('index.html')
            break;
    }
})


let users = [];

var lobbys = []


io.on('connection', socket => {
    socket.emit('serverOn', socket.id)
   

    socket.on('createLobby', function(data){
        let first = Math.random()       
                .toString(36)   
                .substr(-4)     
                .toUpperCase(); 
                
        let last = Math.floor((Math.random() * (9999 - 1000)) + 1000); 

        var lobby = {'name': data.name,
            'playersTotal': data.playersTotal,
            'playetsAtivos': data.playetsAtivos,
            'idioma': data.idioma,
            'open': data.open,
            'id': `${first}-${last}` }
        

        lobbys.push(lobby)

        if(data.open === 'true'){
            socket.broadcast.emit('lobbyUpdata', lobby)
        }


        console.log('New lobby')
    })
    socket.on('searchLobbys', function(data){
        console.log(data)
        socket.emit('lobbysResult', lobbys)
    })
    socket.on('clientOff', function(data){
        console.log(data)
    })
})


server.listen(3000)