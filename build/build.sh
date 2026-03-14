#!/bin/sh

# prepare
echo "Prepare dir......"
rm -fr dist/

# build
echo "Compiling....."
pnpm build || { echo "Compilation failed, please check and try again"; exit 1; }

# 从 package.json 读取版本号并带入文件名
VERSION=$(node -e "console.log(JSON.parse(require('fs').readFileSync('./package.json','utf8')).version)")
ZIP_NAME="iautomator-${VERSION}.zip"

zip -r "$ZIP_NAME" dist/

echo "Packaged done: $ZIP_NAME"

mv -f "$ZIP_NAME" ~/Downloads/

echo "Move to Download"