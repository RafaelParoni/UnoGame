const express = require('express');
const path = require('path');


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

    socket.on('enterLobby', function(id, user){
        console.log('------------------------------')
        console.log(`Procurando lobby com ID: ${id}`)
        console.log(user)
        var lobby = []
        var i = 0
        while( i < lobbys.length){
            if(lobbys[i].id === id){
                console.log("Lobby encontrado!")
                if(lobbys[i].maxPlayers === lobbys[i].players.length){
                    let result = {
                        'msg': 'Lobby cheio :(',
                        'stats': 'error',
                    }
                    socket.emit('enterLobbyResult', result)
                }else{
                    lobbys[i].players.push(
                        {
                        'name': user.name,
                        'icon': user.icon,
                        'id': user.id,
                        'stats': 'member',
                        'cards': [],
                    })
                    let result = {
                        'msg': 'Entrando no lobby!',
                        'stats': 'sucess',
                        'url': `/lobby/${id}`,
                        'id': id
                    }
                    
                    socket.emit('enterLobbyResult', result, lobbys[i])
                }
                lobby = [lobbys[i]]
                i = lobbys.length
            }
            i++
        }

        if(lobby.length === 0){
            let result = {
                'msg': 'Lobby não encontrado',
                'stats': 'error',
            }
            socket.emit('enterLobbyResult', result)
        }
    })

    socket.on('userValidation', function(gameId, user){ // recebe a solicitação de verificação do usuario que acabou de entrar no lobby
        var result = {}
        var i = 0
        while(i < lobbys.length){
            if(gameId === lobbys[i].id){
                var x = 0
                while(x < lobbys[i].players.length){
                    if(lobbys[i].players[x].id === user.id){// envia um [result] para o front end informando os stats do usuario
                        result = {
                            'msg': 'Usuario encontrado na lista do lobby',
                            'stats': 'sucess',
                            'type': 'none',
                        }
                        socket.emit("userValidationResult", result)
                        x = lobbys[i].players.length + 1
                    }
                    x++
                }

                if(x === lobbys[i].players.length){ // envia um [result] para o front end informando os stats do usuario
                    result = {
                        'msg': 'Não foi possivel verificar seu ID com o IDs do lobby',
                        'stats': 'error',
                        'type': 'playerNotFound',
                    }
                    socket.emit("userValidationResult", result)
                    console.log("User não foi encontrado na lista de palyers!")
                }
                i = i + lobbys.length + 1
            }
            i++
        }

        if( i === lobbys.length){ // envia um [result] para o front end informando os stats do usuario
            result = {
                'msg': 'Não foi possivel encontrar o lobby!',
                'stats': 'error',
                'type': 'lobbyNotFound',
            }
            socket.emit("userValidationResult", result)
            console.log("Lobby não encontrado!")
        }
    })


    // recebe um alerta que o usuario saiu da janela, envia um evento para verificar se o usuario fechou a janela ou se abriu outra aba no lugar
    // se fechou a janela ira retornar false e o usuario sera desconectado do jogo
    socket.on('CloseAlert', function(userInfo, GameId){ 
        var response = false
        console.log("Verificando conexão")
        socket.emit('CloseAlertValidation', 'oi ta ai?') // envia o evento de verificação
        socket.on('CloseAlertValidation', function(data){ // recebe um evento de confirmação
            response = true
        })

        setTimeout(function(){ // verifica se o usuario respondeu ou não
            if(response === false){
                discontentGame(userInfo, GameId)
            }   
        },2000)
    })
    socket.on('discontentGame', function(userInfo, GameId){
        discontentGame(userInfo, GameId)
    })


    
})


server.listen(3000)