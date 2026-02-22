#!/bin/sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    if [ "$HUSKY_DEBUG" = "1" ]; then
      echo "husky (debug) - $1"
    fi
  }
  readonly hook_name="$(basename "$0")"
  debug "starting $hook_name..."
  if [ -f ~/.huskyrc ]; then
    debug "sourcing ~/.huskyrc"
    . ~/.huskyrc
  fi
  export readonly husky_skip_init=1
  sh -e "$0" "$@"
  exit $?
fi
