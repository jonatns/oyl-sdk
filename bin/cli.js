#!/usr/bin/env node
'use strict';

const {
  runCLI
} = require('../');

(async () => {
  await runCLI();
})().catch(console.error);
