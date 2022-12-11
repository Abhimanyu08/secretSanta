class Database {
    data: Record<string, string | string[]>
    constructor() {
        this.data = {}
    }

    set(key: string, val: string | string[]) {
        this.data[key] = val
    }

    get(key: string) {
        return this.data[key] || ""
    }

    delete(key: string) {
        delete this.data[key]
    }

}

const database = new Database()
export default database