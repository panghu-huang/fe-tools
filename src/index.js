#!/usr/bin/env node
const program = require('commander')
const { createReactProject } = require('./createReactProject')

program
  .version('1.0.0')
  .command('create')
  .arguments('<project-directory>')
  .description('创建一个 React 项目')
  .action((name) => {
    createReactProject(name)
  })

program.parse(process.argv)