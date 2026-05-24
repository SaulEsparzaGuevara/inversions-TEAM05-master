#!/usr/bin/env bash
set -euo pipefail

# Compare latest two schema versions in api/contracts/coverage/ for breaking changes
DIR="api/contracts/coverage"
if [ ! -d "$DIR" ]; then
  echo "No coverage contracts dir ($DIR) found; exiting 0"
  exit 0
fi

files=("$(ls -1 ${DIR}/*.json 2>/dev/null | sort -V)")
if [ -z "$files" ]; then
  echo "No json schemas found in $DIR"
  exit 0
fi

all=(${files})
len=${#all[@]}
if [ $len -lt 2 ]; then
  echo "Not enough versions to compare (need >=2)."
  exit 0
fi

prev=${all[$((len-2))]}
curr=${all[$((len-1))]}

echo "Comparing prev: $prev -> curr: $curr"

# detect removed properties
removed=$(jq -n --argfile a "$prev" --argfile b "$curr" '
  ($a.properties // {}) as $p | ($b.properties // {}) as $q |
  ($p | keys) - ($q | keys)'
)

added_required=$(jq -n --argfile a "$prev" --argfile b "$curr" '
  ($a.required // []) as $r0 | ($b.required // []) as $r1 |
  ($r1 - $r0)'
)

if [ "$removed" != "[]" ] || [ "$added_required" != "[]" ]; then
  echo "Breaking changes detected:"
  echo "Removed properties: $removed"
  echo "New required fields: $added_required"
  exit 1
fi

echo "No breaking changes detected."
exit 0
