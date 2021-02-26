git add .

echo "Enter the commit message: "

read msg

git commit -m "$msg"

tsc

version=${1:-"minor"}

npm version $version

npm publish --access public

git push
