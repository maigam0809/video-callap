const Socket = require("websocket").server
const http = require("http");

const server = http.createServer((req, res) => {

})

server.listen(3001, () => {
    console.log("listening on port 3001")
})

const webSocket = new Socket({ httpServer: server })

let users = []

webSocket.on("request", (req) => {
    const connection = req.accept()

    connection.on("message", (mess) => {
        const data = JSON.parse(mess.utf8Data)
        const user = findUser(data.username)
        
        switch (data.type) {
            case "store_user": {
                if (user != null) {
                    return
                }
                const newUser = {
                    conn: connection,
                    username: data.username
                }
                users.push(newUser)
                console.log(newUser.username)
                break

            }

            case "store_offer": {
                if (user == null) {
                    return
                }
                user.offer = data.offer
                break
            }
            case "store_candicate": {
                if (user == null) {
                    return
                }
                if (user.candicates == null) {
                    user.candicates = []
                }
                user.candicates.push(data.candicate)
                break;
            }
            case "send_answer": {
                if (user == null) {
                    return
                }
                sendData({
                    type: "answer",
                    answer: data.answer
                }, user.conn)
                break;
            }
            case "send_candicate": {
                if (user == null) {
                    return
                }
                sendData({
                    type: "candicate",
                    candicate: data.candicate
                }, user.conn)
                break;
            }
            case "join_call": {
                if (user == null) {
                    return
                }
                sendData({
                    type: "offer",
                    offder: user.offer
                }, connection)
                user.candicates.forEach(candicate => {
                    sendData({
                        type: "candicate",
                        candicate: candicate
                    }, connection)
                })
            }
        }
    })
    connection.on("close", (reason, desc) => {
        users.forEach(user => {
            if (user.conn == connection) {
                users.splice(users.indexOf(user), 1)
                return
            }
        })
    })
})

function sendData(data, conn) {
    conn.send(JSON.stringify(data))
}

function findUser(username) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].username == username) {
            return users[i]
        }
    }
}