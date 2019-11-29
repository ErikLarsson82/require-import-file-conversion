const fs = require('fs')

const inputFolder = process.argv[2]
const outputFolder = process.argv[3]

if (!inputFolder || !outputFolder) {
	console.error('\x1b[31mYou need to supply two arguments ya dingus:\n', inputFolder, outputFolder)
	process.exit(1)
}

function replacerCurly(match, p1, p2, p3, p4, p5m, offset, string) {
	return ['import {', p2, '} from \'', p4, '\''].join('')
}

function replacerSingle(match, p1, p2, p3, p4, p5m, offset, string) {
	return ['import ', p2, ' from \'', p4, '\''].join('')
}

function replacerExportObject(match, p1) {
	return ['export {'].join('')
}

function replacerExportDefault(match, p1) {
	return ['export default '].join('')
}

function compose(a, b, c, d, e) {
	if (e) {
		console.error('\x1b[31mI dont support more than four arguments ya dingus:\n', arguments)
		process.exit(1)
	}
	return function(x) {
		return a(b(c(d(x))))
	}
}

function parseSingle(fileStr) {
	const reg = /(const )([\r\na-zA-Z, 0-9\-_\/]*)( = require\(')([a-zA-Z0-9.\-_\/]*)('\))/g
	return fileStr.replace(reg, replacerSingle)
}

function parseSpread(fileStr) {
	const reg = /(const {)([\r\na-zA-Z, 0-9\-_\/]*)(} = require\(')([a-zA-Z0-9.\-_\/]*)('\))/g
	return fileStr.replace(reg, replacerCurly)
}

function parseExportObject(fileStr) {
	const reg = /module.exports = {/
	return fileStr.replace(reg, replacerExportObject)
}

function parseExportDefault(fileStr) {
	const reg = /module.exports = /
	return fileStr.replace(reg, replacerExportDefault)
}

const parseAll = compose(parseExportDefault, parseExportObject, parseSpread, parseSingle)

function rewrite(filepath) {
	return (err, file) => {
		fs.writeFile(`${outputFolder}${filepath}`, parseAll(file), () => console.log(`${filepath} done`))
	}
}

function readDirectory(dir) {
	const everything = fs.readdirSync(`${inputFolder}/${dir}`)
	let files = []
	let folders = []
	everything.map(filepath => {
		const fullPathAndFile = `${dir}/${filepath}`
		if (filepath.indexOf('.js') === -1) {
			folders.push(fullPathAndFile)
			const result = readDirectory(fullPathAndFile)
			files = files.concat(result.files)
			folders = folders.concat(result.folders)
		} else {
			files.push(fullPathAndFile)
		}
	})
	return { files, folders }
}

const { files, folders } = readDirectory('')

try {
	fs.mkdirSync(`${outputFolder}`, () => console.log(`creating directory ${outputFolder}`))
} catch(e) {
	console.log(`Skipping folder create: ${outputFolder}`)
}

folders.map(folder => {
	try {
		fs.mkdirSync(`${outputFolder}${folder}`, () => console.log(`creating directory: ${folder}`))
	} catch(e) {
		console.log(`Skipping folder create: ${folder}`)
	}

})

files.forEach(file => {
	fs.readFile(`${inputFolder}${file}`, 'utf8', rewrite(file))
})
