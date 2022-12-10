import { Config, uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator"

const customConfig: Config = {
    dictionaries: [adjectives, colors, animals],
    separator: '-',
    length: 3
}


export default () => uniqueNamesGenerator(customConfig)
