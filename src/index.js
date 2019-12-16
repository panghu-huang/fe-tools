#!/usr/bin/env node
const commander = require('commander')
const { createReactProject } = require('./createReactProject')

const program = new commander.Command()
program
  .name('fe-tools')
  .version('1.0.0')

program
  .command('create <project-directory>')
  .option('-b --branch <branch>', 'repo branch', 'master')
  .action((projectName, options) => {
    const branch = options ? options.branch : 'master'
    createReactProject(projectName, branch)
  })

program.parse(process.argv)