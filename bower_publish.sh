#!/bin/bash

git clone "https://fonero-jenkins@github.com/fonero-project/bower-js-fonero-sdk.git" bower

if [ ! -d "bower" ]; then
  echo "Error cloning"
  exit 1
fi

cp dist/* bower
cd bower
git add .
git commit -m $TRAVIS_TAG
git tag -a $TRAVIS_TAG -m $TRAVIS_TAG
git push origin master --tags
cd ..
rm -rf bower
