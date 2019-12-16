const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const createSpinner = require('ora')
const childProcess = require('child_process')
const { download } = require('./download')

async function createReactProject(projectName, branch) {
  const baseDir = process.cwd()
  const projectPath = path.resolve(baseDir, projectName)
  if (fs.existsSync(projectPath)) {
    console.log(
      chalk.red('已存在同名文件夹')
    )
    process.exit(1)
  }
  const spinner = createSpinner('下载模板中...')

  spinner.start()
  try {
    await download(projectName, branch, baseDir)
    spinner.stop()
    await installPackages(projectPath)
    spinner.succeed('下载成功!')
    openWithVSCode(projectPath)
  } catch (error) {
    spinner.fail('下载失败:' + error.message)
  }
}

/**
 * 用 VSCode 打开项目
 * @param {*} path 目录
 */
async function openWithVSCode(path) {
  childProcess.spawn(
    'code',
    [path],
    {stdio: 'inherit'}
  )
}

/**
 * 用 yarn 安装依赖
 * @param {*} dir 目标目录
 */
async function installPackages(dir) {
  return new Promise((resolve, reject) => {
    const child = childProcess.spawn(
      'yarnpkg',
      ['--cwd', dir],
      {stdio: 'inherit'}
    )

    child.once('close', code => {
      if (code !== 0) {
        reject()
      }
      resolve()
    })
  })
}

exports.createReactProject = createReactProject