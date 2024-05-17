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


var lobbys = []

io.on('connection', socket => {
    socket.emit('serverOn', socket.id)
   
    // Criando novo lobby
    socket.on("createLobby", function(data, user){ // cria um novo lobby na lista de lobbys e avisa todos os usuarios na tela do menu
        const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numeros = '0123456789';
        
        let parteLetras = '';
        let parteNumeros = '';
        let id = '';
        let verifica = false;

        do {
            verifica = false
            for (let i = 0; i < 4; i++) {
                parteLetras += letras.charAt(Math.floor(Math.random() * letras.length));
            }
    
            for (let i = 0; i < 4; i++) {
                parteNumeros += numeros.charAt(Math.floor(Math.random() * numeros.length));
            }

            id = `${parteLetras}-${parteNumeros}`

            if(lobbys.length !== 0){
                for (let i = 0; i < lobbys.length; i++){
                    if(lobbys[i].id === id){
                        console.log(lobbys[i].id + '=' + id)
                        console.log('ID igual encontrado, gerando outro!')
                        i = lobbys.length + 1
                        verifica = true
                    }
                }       
            }else{
                console.log('Nenhum lobby para verificar id')
            }
            
        }
        while (verifica)

        var newLobby = {
            'name': data.name,
            'maxPlayers': data.maxPlayers,
            'lang': data.lang,
            'id': id,
            'publicLobby': data.publicLobby,
            'players': [
                {
                    'name': user.name,
                    'icon': user.icon,
                    'id': user.id,
                    'stats': 'boss',
                    'cards': []
                },
            ],
        }
        lobbys.push(newLobby)
        result = {
            'msg': 'Lobby criado com sucesso!',
            'stats': 'sucess',
            'lobbyId': id,
        }
        socket.emit('createLobbyResult', result)

        if(data.publicLobby === 'true'){
            socket.broadcast.emit('newLobby', newLobby)
        }

        console.log(lobbys)
    })

    socket.on('lobbysRequest', function(){ // recebe a solicitação do request e responder o a lista de lobbys
        var lobbysPublics = []
        var i = 0
        while(i < lobbys.length){
            if(lobbys[i].publicLobby === 'true'){
                lobbysPublics.push(lobbys[i])
            }
            i++
        }

        socket.emit('lobbysResult', lobbysPublics)
    })
   
})


server.listen(3000)