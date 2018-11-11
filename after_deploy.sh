git clone -b gh-pages "https://fonero-jenkins@github.com/fonero-project/js-fonero-sdk.git" jsdoc

if [ ! -d "jsdoc" ]; then
  echo "Error cloning"
  exit 1
fi

jsdoc -c .jsdoc.json --verbose
cd jsdoc
git add .
git commit -m $TRAVIS_TAG
git push origin gh-pages
