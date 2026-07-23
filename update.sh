cd frontend
echo Updating @angular
ng update @angular/cli @angular/core --force --allow-dirty
echo Updating other libraries
#npm install https://cdn.sheetjs.com/xlsx-latest/xlsx-latest.tgz
npm update
npm audit fix
npm version patch
npm prune
ng build
ng test --watch=false
npm outdated
echo Done!
read -n 1
