import { promises as fs } from 'fs'
import path from 'path'
import {Competiton, LiveData } from './entities'


export const getLiveCompetition = async (): Promise<LiveData> => {
    const rawFileContents = await fs.readFile(path.join(process.cwd(), '/data/liveData.json'), 'utf8')
    const liveCompetitions = JSON.parse(rawFileContents)
    return liveCompetitions.liveData
}

export const getCompetitions = async (): Promise<Competiton[]> => {
    const postsDirectory = path.join(process.cwd(), '/data/competitions/')
    const filenames = await fs.readdir(postsDirectory)

    const competitions: Promise<Competiton>[] = filenames.map(async (filename) => {
        const filePath = path.join(postsDirectory, filename)
        const rawFileContents = await fs.readFile(filePath, 'utf8')

        // Generally you would parse/transform the contents
        // For example you can transform markdown to HTML here

        const file = JSON.parse(rawFileContents)

        return {
            name: filename.split(".")[0] ?? "",
            info: file?.info ?? null,
            place: file.place ?? null,
            dates: file?.dates ?? null,
            races: file.data
        }
    })
    // return competitions
    return await Promise.all(competitions)
}


