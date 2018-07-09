/* eslint-disable func-names, no-console, no-await-in-loop, prefer-destructuring */

const fetch = require('node-fetch');
const path = require('path');
const flatten = require('lodash.flatten');
// const del = require('del');
const makeDir = require('make-dir');
const download = require('download');
const ProgressBar = require('progress');
const fs = require('fs');

const apiHost = 'https://api.bootcdn.cn';
const cdnHost = 'https://cdn.bootcss.com';

// JavaScript heap out of memory
let filePath;
let url;
let dirName;
const downloadOption = {};
let progressBar;

const sleep = function (delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

const getFilesByPackageName = async (name) => {
  const { assets = [] } = await fetch(`${apiHost}/libraries/${name}.min.json`).then(r => r.json());
  const pathss = assets
    // 暂时只取前十个版本, 作为 demo 展示
    .filter((_, ind) => (ind <= 5))
    .map(({ version, files = [] }) => files.map(fileName => ({
      name: `${name}_${version}_${fileName}`,
      filePath: path.resolve(__dirname, '../packages', name, version, fileName),
      url: `${cdnHost}/${name}/${version}/${fileName}`,
    })));
  return flatten(pathss);
};

const getFilesByUrl = async (thisLibList) => {
  for (let index = 0; index < thisLibList.length; index += 1) {
    filePath = thisLibList[index].filePath;
    url = thisLibList[index].url;
    dirName = path.dirname(filePath);
    downloadOption.filename = path.basename(filePath);
    if (!fs.existsSync(filePath)) {
      try {
        await makeDir(dirName);
        await sleep(10);
        await download(url, dirName, downloadOption);
      } catch (error) {
        console.log('Something error:', url);
        console.log(error);
      }
    }
    progressBar.tick();
  }
};

(async function () {
  const splitLine = '---------------------------------------------------';

  console.log(splitLine);
  console.log('Start process...');
  // console.log('Cleaning ./packages');
  // await del(path.resolve(__dirname, '../packages/**/*.*'));
  // console.log();

  console.log(splitLine);
  console.log('Start sync...');

  const libList = await fetch(`${apiHost}/names.min.json`).then(r => r.json());
  await sleep(50);

  let thisLibList;
  console.log('Total list items:', libList.length + 1);

  for (let i = 0; i < libList.length; i += 1) {
    thisLibList = await getFilesByPackageName(libList[i]);
    await sleep(20);
    progressBar = new ProgressBar(`${libList[i]} [:bar] :percent :elapsed s`, {
      complete: '=',
      incomplete: '-',
      width: 30,
      total: thisLibList.length,
    });
    await getFilesByUrl(thisLibList);
    await sleep(20);
  }
  console.log('Finished!!');
}());
