#!/bin/bash

set -e

cd ../../js-fonero-lib-gh-pages
git checkout -- .
git clean -dfx
git fetch
git rebase
rm -Rf *
cd ../js-fonero-lib/website
npm run-script docs
cp -R docs/* ../../js-fonero-lib-gh-pages/
rm -Rf docs/
cd ../../js-fonero-lib-gh-pages
git add --all
git commit -m "update website"
git push
cd ../js-fonero-lib/website