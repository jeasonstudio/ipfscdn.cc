import threading
import requests
import os
import json
import time
from tqdm import tqdm
from multiprocessing import Process

CWD = os.getcwd() + '/py-packages/'

def download(link, filelocation):
  if os.path.exists(filelocation):
    return
  r = requests.get(link, stream=True)
  dirName = os.path.dirname(filelocation)
  if not os.path.exists(dirName):
    try:
      os.makedirs(dirName)
    except OSError as e:
      pass
  with open(filelocation, 'wb') as f:
    for chunk in r.iter_content(1024):
      if chunk:
        f.write(chunk)

def createNewDownloadThread(link, filelocation):
  # while threading.active_count() > 4:
  #   time.sleep(10)
  download_thread = Process(target=download, args=(link, filelocation))
  # download_thread = threading.Thread(target=download, args=(link,filelocation))
  download_thread.start()
  download_thread.join()

def getAssetsByLibName(ln):
  return requests.get('https://api.bootcdn.cn/libraries/' + ln + '.min.json').json()['assets']

def formatAssetsToDownload(libName, assets):
  fileList = []
  for aet in assets:
    libVersion = aet['version']
    for filePath in aet['files']:
      fileDict = {}
      fileDict['libName'] = libName
      fileDict['id'] = '%s_%s_%s' % (libName, libVersion, filePath)
      fileDict['fileOsPath'] = '%s%s/%s/%s' % (CWD, libName, libVersion, filePath)
      fileDict['url'] = 'https://cdn.bootcss.com/%s/%s/%s' % (libName, libVersion, filePath)
      fileList.append(fileDict)
  return fileList

def downloadFilesFromFileList(fileList):
  pbar = tqdm(fileList)
  for item in pbar:
    pbar.set_description("Asyncing %s" % item['libName'])
    createNewDownloadThread(item['url'], item['fileOsPath'])
    # download(item['url'], item['fileOsPath'])

libList = requests.get('https://api.bootcdn.cn/names.min.json').json()
for libName in libList:
  fileLists = formatAssetsToDownload(libName, getAssetsByLibName(libName))
  downloadFilesFromFileList(fileLists)
