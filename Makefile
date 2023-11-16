# The default make command.
DEFAULT = help

# Use 'VERBOSE=1' to echo all commands, for example 'make help VERBOSE=1'.
ifdef VERBOSE
 Q :=
else
 Q := @
endif

# Define the 'clean' target.
.PHONY: clean

# The 'all' target.
all: $(DEFAULT)

# The 'clean' target.
clean:
   $(Q)rm -rf node_modules apps/**/node_modules apps/**/.next packages/**/node_modules
   $(Q)echo "--- Deleted UI build artifacts"

# The 'install' target.
install:
   $(Q)yarn install
   $(Q)echo "--- Dependencies installed"

# The 'reset' target.
reset:
   $(Q)rm -rf lib
   $(Q)yarn build
   $(Q)echo "--- reset"