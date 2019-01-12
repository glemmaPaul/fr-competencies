import fs from 'fs'
import parse from 'csv-parse'
import debugFactory from 'debug'
import program from 'commander'
import moment from 'moment'

import generatePDF from './index'

const debug = debugFactory('elodie')

const dateFormat = 'MM/YY'

const output = []

async function loadCSV(path) {
    const input = fs.readFileSync(path).toString('ascii')

    return new Promise((resolve, reject) => {
        parse(input, { delimiter: ','}, (err, records) => {
            if (err) {
                reject(err)
                return
            }

            resolve(records)
        })
    })
}

async function parseRecords(records, start, end, viewOptions) {
    const headers = records[0]
    const category = headers[0]
    const students = headers.slice(2, headers.length)
    
    const competencies = records.slice(1, records.length)

    students.map((student, index) => {
        debug(`Generating PDF for ${student}, from ${start.format('MM/YYYY')} to ${end.format('MM/YYYY')}`)
        
        // Pick images
        const studentCompetencies = competencies.filter((competency) => {
            const competencyDate = moment(competency[index + 2], dateFormat)

            return start <= competencyDate && end >= competencyDate
        })

        const images = studentCompetencies.map(item => `./images/${item[1]}`)

        const pages = Math.floor(images / 15)

        generatePDF(`./output/${student}.pdf`, {
            studentName: student,
            year: 'SP',
            category: category,
            images,
            ...viewOptions
        })
    })
    
}


    
program
.version('0.1.0')
.arguments('<path> <start> <end>')
.option('-y --year', 'What year', 'SP')
.option('-B --background', 'What background', 'blue')
.action(function (path, start, end, options) {
    return loadCSV(path).then((records) => {
        const startDate = moment(start, dateFormat)
        const endDate = moment(end, dateFormat)
        debug(options)

        return parseRecords(records, startDate, endDate, options)
    })
});
  
program.parse(process.argv);