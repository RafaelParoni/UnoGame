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


let users = [];

var lobbys = []


io.on('connection', socket => {
    socket.emit('serverOn', socket.id)
   

    socket.on('createLobby', function(data){

        console.log('----------------------------------')
        var first = Math.random()       
                .toString(36)   
                .substr(-4)     
                .toUpperCase(); 
                
        var last = Math.floor((Math.random() * (9999 - 1000)) + 1000); 

        var id =  `${first}-${last}`

        console.log(`Gerando ID: ${id}`)
        
        console.log(`Verificando ID: ${id}`)
        var i = 0
        var idValid = true
        while(i < lobbys.length){   
            if(id === lobbys[i].id){
                console.log('Já existe esta ID registrado, gerando outro aleatoriamente:')
                first = Math.random()       
                .toString(36)   
                .substr(-4)     
                .toUpperCase(); 
                
                last = Math.floor((Math.random() * (9999 - 1000)) + 1000); 

                id = `${first2}-${last2}`
                console.log(id)

            }else if(i === lobbys.length){
                console.log('Nenhum ID igual a esta no momento')
                i = lobbys[i].length + 5
                idValid = true
            }
            i++
        }
        console.log(`ID gerado e verificado com sucesso`)

        if(idValid === true){
            var lobby = {'name': data.name,
                'playersTotal': data.playersTotal,
                'playetsAtivos': data.playetsAtivos,
                'idioma': data.idioma,
                'open': data.open,
                'id': id }
            
    
            lobbys.push(lobby)
            console.log('Lobby criando com sucesso com ID: ' + id)
            socket.emit("createLobbyResult", {'msg': 'Lobby criando com sucesso', 'stats': 'sucess', 'id': id})
        }else{
            console.log('Não foi possivel criar o lobby')
            socket.emit("createLobbyResult", {'msg': 'Não foi possivel criar o lobby', 'stats': 'error', 'id': '???'})
        }


        if(data.open === 'true'){
            socket.broadcast.emit('lobbyUpdata', lobby)
        }

    })
    socket.on('searchLobbys', function(data){
        console.log(data)
        socket.emit('lobbysResult', lobbys)
    })
    socket.on('enterGame', function(id){
        var result = {
            'msg': '',
            'stats': '',
            'id': '',
        }
        var i = 0
        while(i < lobbys.length){
            if(lobbys[i].id === id){
                console.log(`Players: ${lobbys[i].playetsAtivos}/${lobbys[i].playersTotal}`)
                if(lobbys[i].playetsAtivos < lobbys[i].playersTotal){
                    console.log('Entrando no lobby')
                    lobbys[i].playetsAtivos = lobbys[i].playetsAtivos + 1
                    result = {
                        'msg': 'Entrando no lobby!',
                        'stats': 'sucess',
                        'id': id,
                    }
                    socket.emit('enterGameResult', result)
                }else{
                    console.log('Lobby cheio')
                    result = {
                        'msg': 'Lobby cheio!',
                        'stats': 'error',
                        'id': '???',
                    }
                    socket.emit('enterGameResult', result)
                }
            }
            i++
        }
    })
    socket.on('clientOff', function(data){
        console.log(data)
    })
})


server.listen(3000)