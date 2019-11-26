const fs = require('fs')

function replacerCurly(match, p1, p2, p3, p4, p5m, offset, string) {
	return ['import {', p2, '} from \'', p4, '\''].join('')
}

function replacerSingle(match, p1, p2, p3, p4, p5m, offset, string) {
	return ['import ', p2, ' from \'', p4, '\''].join('')
}

function replacerExports(match, p1) {
	return ['export default '].join('')
}

function compose(a, b, c) {
	return function(x) {
		return a(b(c(x)))
	}
}

function parseSingle(fileStr) {
	const reg = /(const )([\r\na-zA-Z, 0-9]*)( = require\(')([a-zA-Z/0-9.]*)('\))/g
	return fileStr.replace(reg, replacerSingle)
}

function parseSpread(fileStr) {
	const reg = /(const {)([\r\na-zA-Z, 0-9]*)(} = require\(')([a-zA-Z/ 0-9.]*)('\))/g
	return fileStr.replace(reg, replacerCurly)
}

function parseExports(fileStr) {
	const reg = /module.exports = /
	return fileStr.replace(reg, replacerExports)	
}

const parseAll = compose(parseExports, parseSpread, parseSingle)

function rewrite(filepath) {
	return (err, file) => {
		fs.writeFile(`output${filepath}`, parseAll(file), () => console.log(`${filepath} done`))
	}
}

function readDirectory(dir) {
	const everything = fs.readdirSync(`input/${dir}`)
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
	fs.mkdirSync(`output`, () => console.log('creating directory output'))
} catch(e) {
	console.log('Skipping folder create \'output\'')
}

folders.map(folder => {
	try {
		fs.mkdirSync(`output${folder}`, () => console.log('creating directory ' + folder))
	} catch(e) {
		console.log(`Skipping folder create ${folder}`)
	}
	
})

files.forEach(file => {
	fs.readFile(`input${file}`, 'utf8', rewrite(file))
})
