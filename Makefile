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
	$(Q)oyl-cli test
	$(Q)echo "--- test complete"
sendCollectible: reset
	$(Q)oyl-cli send-collectible
