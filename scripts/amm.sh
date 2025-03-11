#!/bin/bash

# Exit on error
set -e

# Initialize regtest environment
#oyl regtest init -p alkanes -a bcrt1qzr9vhs60g6qlmk7x3dd7g3ja30wyts48sxuemv
#oyl regtest sendFromFaucet --to "bcrt1qcr8te4kr609gcawutmrza0j4xv80jy8zeqchgx" -s 1000000 
# Function to execute command and generate blocks
execute_and_generate() {
    $1
    oyl regtest genBlocks -p alkanes
    sleep 5
}

# # Deploy pool contract
# execute_and_generate "oyl alkane new-contract -c ../src/cli/contracts/pool.wasm -data 3,65519,50 -p alkanes -feeRate 5"

# # Deploy factory contract
# execute_and_generate "oyl alkane new-contract -c ../src/cli/contracts/factory.wasm -data 1,0,0,65519 -p alkanes -feeRate 5"

# # Deploy free mint contract
# execute_and_generate "oyl alkane new-contract -c ../src/cli/contracts/free_mint.wasm -data 3,3,100 -p alkanes -feeRate 5"

# # Create first token
# execute_and_generate "oyl alkane new-token -pre 1000000 -amount 10000 -c 100000000 -name 'TEST' -symbol 'TEST1' -resNumber 3"

# # Create second token
# execute_and_generate "oyl alkane new-token -pre 1000000 -amount 10000 -c 100000000 -name 'TESTER' -symbol 'TEST2' -resNumber 3"

# # Deploy router contract
# execute_and_generate "oyl alkane new-contract -c ../src/cli/contracts/router.wasm -data 1,0,0,2,1 -p alkanes -feeRate 5"

execute_and_generate "oyl alkane create-pool -data 2,1,1 -tokens 2:2:50000,2:3:50000 -feeRate 5 -p alkanes"

# execute_and_generate
