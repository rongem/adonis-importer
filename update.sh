cd frontend
echo Updating @angular
ng update @angular/cli @angular/core @ngrx/store --force --allow-dirty
echo Updating other libraries
rem npm install https://cdn.sheetjs.com/xlsx-latest/xlsx-latest.tgz
npm update
npm audit fix
rem grunt bump
npm prune
npm outdated
echo Done!
read -n 1
