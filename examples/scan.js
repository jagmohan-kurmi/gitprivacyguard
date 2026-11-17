const { scanPath, formatTextReport } = require('../dist/src');

const result = scanPath('./tests');
console.log(formatTextReport(result));
