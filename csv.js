import fs from 'fs'
import parse from 'csv-parse'
import debugFactory from 'debug'
import program from 'commander'
import moment from 'moment'

import generatePDF from './index'

const debug = debugFactory('elodie')

const dateFormat = 'MM/YYYY'

const output = []

async function loadCSV(path) {
    const input = fs.readFileSync(path).toString('utf8')

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

        // Validate of all images are existent
        images.forEach((image) => {
            if (fs.existsSync(image) === false) {
                console.error(`Error in generating for "${student}", cannot retrieve "${image}", does not exist`)
            }
        })

        const duplicates = students.slice(0, index).reduce((number, otherStudent) => {
            if (student === otherStudent) {
                return number + 1
            }

            return number
        }, 0)

        let filename = `${student}`

        if (duplicates > 0) {
            filename = `${filename}-(${duplicates})`
        }

        generatePDF(`./output/${filename}.pdf`, {
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
.option('-y --year', 'What year', 'PS')
.option('-B --background <background>', 'What background', '#ff3399')
.action(function (path, start, end, options) {
    return loadCSV(path).then((records) => {
        const startDate = moment(start, dateFormat)
        const endDate = moment(end, dateFormat)
        debug(options)

        return parseRecords(records, startDate, endDate, options)
    })
});
  
program.parse(process.argv);