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

    if(path === '/menu/'){
        res.render('menu.html')
    }else if(path.includes('/lobby/')){
        res.render('lobby.html')
    }else if(path.includes('/game/')){
        res.render('game.html')
    }else{
        res.render('index.html')
    }
})

/* SESSION STORAGE
name  - user name
icon - user icon
id - sockect id
stats - inGame - Lobby - Menu
gameId - se InGame for verdadeiro

--  LOBBY/GAME 
name - lobby/game name
MaxPlayers - maximo de players
QuantidadePlayers - players no lobby/game
players [
    {
        'name': 'user name'
        'icon': 'user icon'
        'id': 'user id',
        'cards': [
            {
                name: 1
                value: 1
                color: red
            },
            {
                name: +2
                value: +2
                color: yellow
            }
        ]
    },
]

*/


io.on('connection', socket => {
    socket.emit('serverOn', socket.id)
   

   
})


server.listen(3000)