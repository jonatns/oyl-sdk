#!/usr/bin/env node
'use strict';


const  { runCLI } = require("../lib/cli");

(async () => {
  await runCLI();
})().catch(console.error);
