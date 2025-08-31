@echo off
echo Iniciando Sistema de Gestion de Productos
echo.
echo Abriendo terminal para backend...
start cmd /k "cd server && npm run dev"
echo.
echo Abriendo terminal para frontend...
start cmd /k "cd client && npm start"
echo.
echo Listo! Cierra esta ventana.
pause
