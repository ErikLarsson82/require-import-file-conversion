const fs = require('fs')

function replacerCurly(match, p1, p2, p3, p4, p5m, offset, string) {
	return ['import {', p2, '} from \'', p4, '\''].join('')
}

function replacerSingle(match, p1, p2, p3, p4, p5m, offset, string) {
	return ['import ', p2, ' from \'', p4, '\''].join('')
}

function compose(a, b) {
	return function(x) {
		return a(b(x))
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

const parseAll = compose(parseSpread, parseSingle)

function rewrite(filepath) {
	return (err, file) =>
		fs.writeFile(`output/${filepath}`, parseAll(file), () => console.log(`${filepath} done`))
}
//fs.readFile('files/input.js', 'utf8', rewrite)

fs.readdir('input', function(err, files) {
	files.map(filepath => {
		fs.readFile(`input/${filepath}`, 'utf8', rewrite(filepath))
	})
})