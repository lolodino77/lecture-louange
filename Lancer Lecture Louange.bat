@echo off
chcp 65001 >nul
title Lecture Louange
cd /d "%~dp0"
rem Double-clic : demarre le site en local et l'ouvre dans le navigateur par defaut.
rem Fermer cette fenetre arrete le programme.

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js est introuvable. Installez-le depuis https://nodejs.org puis relancez ce fichier.
  echo.
  pause
  exit /b 1
)

rem Premiere utilisation : installe les outils si besoin.
if not exist "node_modules\" (
  echo  Premiere utilisation : installation des outils, quelques instants...
  call npm install
  if errorlevel 1 (
    echo.
    echo  L'installation a echoue, voir le message ci-dessus.
    pause
    exit /b 1
  )
)

rem Genere le site s'il n'existe pas encore.
if not exist "site\index.html" (
  echo  Generation du site...
  node scripts\build.js
  if errorlevel 1 (
    echo.
    echo  La generation du site a echoue, voir le message ci-dessus.
    pause
    exit /b 1
  )
)

echo.
echo  Lecture Louange demarre : le navigateur va s'ouvrir sur http://localhost:8123/
echo  Laissez cette fenetre ouverte pendant que vous lisez. Fermez-la pour arreter.
echo.
node scripts\serve.js site 8123 --open
if errorlevel 1 (
  echo.
  echo  Le programme s'est arrete avec une erreur, voir le message ci-dessus.
  pause
)
