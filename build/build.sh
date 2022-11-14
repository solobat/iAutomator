#!/bin/sh

# prepare
echo "Prepare dir......"
rm -fr dist/

# build
echo "Compiling....."
yarn turbo build || { echo "Compilation failed, please check and try again"; exit 1; }

zip -r ihelpers.zip dist/

echo "Packaged done"

mv -f ihelpers.zip ~/Downloads/

echo "Move to Download"