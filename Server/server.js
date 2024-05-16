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