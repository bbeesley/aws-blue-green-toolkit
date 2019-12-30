#!/bin/bash -eo pipefail
last_commit="$(git log -1 --pretty=%B | cat | grep 'chore(release)')" || true
echo "got commit"
if [[ ${last_commit} == *[chore\(release\)]* ]]
then echo "last commit was release, skipping semantic release step"
else npm run release
fi
