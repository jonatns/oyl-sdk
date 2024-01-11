#!/usr/bin/env node
'use strict'

const { runCLI } = require('../lib/tests/cli')

;(async () => {
  await runCLI()
})().catch(console.error)
