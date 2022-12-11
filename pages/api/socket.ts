import { Server } from 'socket.io'

import * as room from "../../utils/roomFuncs"
import database from "../../utils/database"

const ioHandler = (_: any, res: any) => {
    if (!res.socket.server.io) {
        console.log('*First use, starting socket.io')

        const io = new Server(res.socket.server)

        io.on("connection", (socket) => {

            socket.join(socket.id)

            socket.on("createRoom", async (roomId: string, ownerName: string) => {
                await room.makeRoom(roomId, socket.id, ownerName)
                socket.join(roomId)
                io.to(roomId).emit("joined", { members: [ownerName] });
            })

            socket.on("joinRoom", async (roomId: string, friendName: string) => {
                const newMembers = await room.addToRoom(roomId, socket.id, friendName)
                socket.join(roomId)
                io.to(roomId).emit("joined", { members: newMembers });
            })

            socket.on("getSecretSanta", async (roomId: string) => {
                const santaObj = await room.getSantasFromRoom(roomId)
                const sleep = (s: number) => new Promise((resolve) => setTimeout(resolve, s * 1000))

                io.to(roomId).emit("allotingSanta")

                await sleep(1)

                Object.entries(santaObj).forEach(async (val) => {
                    const nameOfRecipient = await database.get(val[1])
                    io.to(val[0]).emit("santa", nameOfRecipient as string)
                })

            })

            socket.on("getSecretSantaAgain", async (roomId: string, comment: string) => {
                const requestee = await database.get(socket.id)
                io.to(roomId).emit("allotRequest", { requestee, comment })
            })

            socket.on("destroyRoom", async (roomId: string) => {
                room.destroyRoom(roomId, socket.id)
            })
        })

        res.socket.server.io = io
    } else {
        console.log('socket.io already running')
    }
    res.end()
}

export const config = {
    api: {
        bodyParser: false
    }
}

export default ioHandler