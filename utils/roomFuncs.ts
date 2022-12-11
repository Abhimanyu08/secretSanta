import database from "./database"

export async function makeRoom(roomId: string, socketId: string, name: string) {

    await database.set(socketId, name)
    await database.set(roomId, [socketId])

}

export async function addToRoom(roomId: string, socketId: string, name: string) {

    database.set(socketId, name)
    const members = await database.get(roomId) as string[]
    const newMembers = [...members, socketId]
    database.set(roomId, newMembers)
    return newMembers.map((val) => database.get(val))
}

export function destroyRoom(roomId: string, socketId: string) {
    database.delete(roomId)
    database.delete(socketId)
}

export async function getSantasFromRoom(roomId: string): Promise<Record<string, string>> {
    let members = await database.get(roomId) as string[]
    const arrayOfIndices = Array.from({ length: members.length })
        .map((_, i) => i)
        .filter(i => i !== undefined);

    let shuffledIndexes = shuffle(arrayOfIndices)
    while (!checkRandomIsCorrect(shuffledIndexes)) {
        shuffledIndexes = shuffle(arrayOfIndices)
    }

    let secretSantaObj: Record<string, string> = {}
    members.forEach((val, idx) => secretSantaObj[val] = members[shuffledIndexes[idx]])
    return secretSantaObj
}

function shuffle(array: number[]) {
    return array.sort(() => Math.random() - 0.5);
}

function checkRandomIsCorrect(arr: number[]) {
    return !arr.some((val, idx) => val === idx)
}
