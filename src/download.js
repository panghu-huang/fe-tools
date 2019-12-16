const https = require('https')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const compressing = require('compressing')

const TEMPLATE_NAME = 'react-ts-template'

exports.download = function download(projectName, branch, parentDir) {
  return new Promise((resolve, reject) => {
    const zipFilename = path.join(parentDir, 'temp.zip')
    const stream = fs.createWriteStream(zipFilename)

    https.get({
      protocol: 'https:',
      host: 'codeload.github.com',
      path: `/wokeyi/${TEMPLATE_NAME}/zip/${branch}`,
    }, res => {

      res.pipe(stream)

      res.on('end', async () => {
        try {
          stream.end()
          // 解压到目标文件夹下面
          const projectDir = path.join(parentDir, projectName)
          await unzip(zipFilename, projectDir)
          // 删除 temp.zip 文件
          fs.unlinkSync(zipFilename)
          const unzipDir = `${TEMPLATE_NAME}-${branch}`
          copyDir(
            path.join(projectDir, unzipDir),
            projectDir,
          )
          deleteDir(
            path.join(projectDir, unzipDir)
          )
          modifyPackageJSON(
            path.join(projectDir, 'package.json'),
            projectName
          )
          resolve()
        } catch (error) {
          reject(error)
        }
      })

      res.on('error', error => {
        reject(error)
      })
    })
  })
}

async function unzip(source, dest) {
  await compressing.zip.uncompress(source, dest)
}

function modifyPackageJSON(pkgPath, projectName) {
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(
      fs.readFileSync(pkgPath, 'utf-8')
    )
    pkg.name = projectName
    fs.writeFileSync(pkgPath, JSON.stringify(pkg))
  }
}

function deleteDir(directory) {
  if (fs.existsSync(directory)) {
    const files = fs.readdirSync(directory)
    if (files.length) {
      files.forEach(filename => {
        const filePath = path.join(directory, filename)
        const stats = fs.statSync(filePath)
        if (stats.isDirectory()) {
          deleteDir(filePath)
        } else {
          fs.unlinkSync(filePath)
        }
      })
    }
    fs.rmdirSync(directory)
  }
}

function copyDir(source, dest) {
  if (fs.existsSync(source) && fs.existsSync(dest)) {
    const files = fs.readdirSync(source)
    if (files.length) {
      files.forEach(filename => {
        const filePath = path.join(source, filename)
        const targetPath = path.join(dest, filename)
        const stats = fs.statSync(filePath)
        if (stats.isDirectory()) {
          fs.mkdirSync(targetPath)
          copyDir(filePath, targetPath)
        } else {
          fs.copyFileSync(filePath, targetPath)
        }
      })
    }
  } else {
    !fs.existsSync(source) 
      && console.log(chalk.red(`文件夹(${source})不存在`))

    !fs.existsSync(dest) 
      && console.log(chalk.red(`文件夹(${dest})不存在`))
  }
}