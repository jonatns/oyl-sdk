# The default make command.
DEFAULT = help
# Use 'VERBOSE=1' to echo all commands, for example 'make help VERBOSE=1'.
ifdef VERBOSE
  Q :=
else
  Q := @
endif
.PHONY: \
		clean
all: $(DEFAULT)
help:
	$(Q)echo "make clean             - Deletes binaries and documentation."
	$(Q)echo "make install             - Installs dependencies."
	$(Q)echo "make reset             - Cleans out lib and rebuilds."
clean:
	$(Q)rm -rf lib
	$(Q)echo "--- Deleted UI build artifacts"

install:
	$(Q)yarn
	$(Q)echo "--- Dependencies installed"

reset:
	$(Q)rm -rf lib
	$(Q)yarn build
	$(Q)echo "--- reset"
sendBtc: reset
	$(Q)oyl-cli send
	$(Q)echo "--- test complete"
sendBRC20: reset
	$(Q)oyl-cli sendBRC20
	$(Q)echo "--- test complete"
sendCollectible: reset
	$(Q)oyl-cli send-collectible
ordTest: reset
	$(Q)oyl-cli ord-test
	$(Q)echo "--- test complete"
txnHistory: reset
	$(Q)oyl-cli txn-history
	$(Q)echo "--- test complete"
testnetSend: reset
	$(Q)oyl-cli testnet-send
	$(Q)echo "--- test complete"
testAll: sendBRC20 sendCollectible sendBtc
	$(Q)echo "--- test all complete"
