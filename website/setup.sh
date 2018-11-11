#!/bin/bash

cd ../../
if [ "$TRAVIS" ]; then
  git clone "https://fonero-jenkins@github.com/fonero-project/js-fonero-lib.git" js-fonero-lib-gh-pages
else
  git clone git@github.com:fonero-project/js-fonero-lib.git js-fonero-lib-gh-pages
fi
cd js-fonero-lib-gh-pages
git checkout origin/gh-pages
git checkout -b gh-pages
git branch --set-upstream-to=origin/gh-pages
cd ../js-fonero-lib/website
