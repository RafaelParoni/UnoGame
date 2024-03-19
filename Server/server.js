const exp = require('constants')
const express = require('express')
const path = require('path')


const app  = express()
const server = require('http').createServer(app);
const io =  require('socket.io')(server);

app.use(express.static(path.join(__dirname, './../Client/')));
app.set('views', path.join(__dirname, './../Client/'));
app.engine('html' , require('ejs').renderFile);
app.set('view engine', 'html');


app.use('/', (req, res) => {
    res.render('index.html')
})

let connections = [];
let users = [];
let lobbys = [];

io.on('connection', socket => {
    socket.emit('serverOn', socket.id)
    socket.on('OldClient', function(data){
        console.log(connections)
        console.log('----------------')
        var i = 0
        if(connections.length === 0){
            console.log('Nao tem nenhum user aqui')
            connections.push(data)
        }else{
            while(i < connections.length){
                if(data === connections[i]){
                    console.log(`TEM ELE AQUI ${data} === ${connections[i]}`)
                    break
                }
                if(i+1 === connections.length){
                    console.log(`USER: ${data} NAO ESTA AQUI`)
                    connections.push(data)
                    break
                }
                i++
            }
        }
    })
    socket.on('NewClient', function(data){
        console.log(`New User: ${data}`)
        connections.push(data)
        socket.emit('ClientConfirm', {
            Client: data,
            msg: 'Confirm Client database'
        })
    })

    socket.on('userRegister', function(data){
        console.log('Novo user')
        var i = 0
       if(users.length === 0){
            users.push(data)
       }else{
        while(i < users.length){
            if(data.id === users[i].id){
                console.log('USER JA SALVO')
                break
            }
            if(i+1 === users.length){
                console.log('Salvando novo user')
                users.push(data)
                break
            }
            i++
        }
       }
    })

    var i = 0
     while(i < users.length){
        if(socket.id === users[i].id){
            console.log('USER JA SALVO')
            socket.emit('OldUserver', users[i])
            break
        }  
        i++
    }
    

    



    socket.on('connectionsList', function(data){
        socket.emit('connectionsListResult', connections)
    })
    socket.on('clientOff', function(data){
        console.log(data)
    })
})


server.listen(3000)