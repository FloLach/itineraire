# Developement
Il faut installer (node.js)[https://nodejs.org/en/download]
Lancer à la racine du projet
    npm start

Ouvrir l'url afficher.
Le script principale est map.js.

# Deployment
Lancer à la racine du projet
    npm run build
    mkdir .\dist\javascript
    mkdir .\dist\pages
    mkdir .\dist\css 
    mv .\dist\assets\index-*.js .\dist\javascript\mapv2.js
    mv .\dist\assets\index-*.css .\dist\css\mapv2.css
    cp .\map.inc .\dist\pages\map.inc
    rm .\dist\index.html
    rm -r .\dist\assets

Copier avec le client ftp le contenu de dist dans le module itineraire.

