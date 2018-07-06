/* eslint-disable func-names */

const fetch = require('node-fetch');
const path = require('path');
const flatten = require('lodash.flatten');
const makeDir = require('make-dir');

const host = 'https://api.bootcdn.cn';
const { NODE_ENV = 'production' } = process.env;
const getUrl = (name, min) => (!min || NODE_ENV === 'production' ? `${host}/${name}.json` : `${host}/${name}.min.json`);

module.exports.libraries = async function () {
  return fetch(getUrl('libraries')).then(r => r.json());
};

module.exports.names = async function () {
  return fetch(getUrl('names')).then(r => r.json());
};

exports.names().then((r) => {
  r.length = 10;
  console.log(r);
});

const mkdirs = async (name) => {
  const { assets = [] } = await fetch(`https://api.bootcdn.cn/libraries/${name}.min.json`).then(r => r.json());
  const pathss = assets
    .map(({ version, files = [] }) => files.map(fileName => path.resolve(__dirname, '../packages', name, version, fileName)));
  return flatten(pathss);
};

// (async function () {
//   const names = await exports.names();
//   names.length = 10;
//   for (let index = 0; index < names.length; index += 1) {

//   }
// }());

mkdirs('react').then((p) => {
  console.log(p);
  Promise.all(p.map(filePath => makeDir.call(null, filePath)));
});
