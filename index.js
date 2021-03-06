import path from 'path'
import fs from 'fs'
import pdf from 'html-pdf'
import Mustache from 'mustache'
import debugFactory from 'debug'

const debug = debugFactory('elodie')

debug('Executing script')

var template = fs.readFileSync('./html/achievements.html', 'utf8');
var options = { 
  format: 'A4', 
  base: `file://${__dirname}/`, 
  footer: { height: "30px" }, 
  header: { height: "40px" } 
};


export default async function generatePDF(path, templateOptions) {
  const html = Mustache.render(template, templateOptions)
  
  pdf.create(html, options).toFile(path, function(err, res) {
    if (err) return console.log(err);
    console.log(res);
  });
}

// pink : FF78BB
// red : red
// blue : 40CAF3
// green : 96C065
// purple : 64447C
// yellow : FFDE19
