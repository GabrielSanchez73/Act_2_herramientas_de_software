@echo off
chcp 65001 >nul
title Sistema de Gestión de Productos - Iniciador

echo.
echo ========================================
echo 🚀 SISTEMA DE GESTIÓN DE PRODUCTOS
echo ========================================
echo.
echo Iniciando verificación del sistema...
echo.

:: Verificar si Node.js está instalado
echo 📡 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js no está instalado o no está en el PATH
    echo    Por favor, instala Node.js desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js encontrado: 
node --version

:: Verificar si MySQL está ejecutándose
echo.
echo 🗄️ Verificando MySQL...
netstat -an | findstr ":3306" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ ADVERTENCIA: MySQL no parece estar ejecutándose en el puerto 3306
    echo    Asegúrate de que MySQL esté iniciado antes de continuar
    echo.
) else (
    echo ✅ MySQL está ejecutándose en el puerto 3306
)

:: Verificar dependencias del servidor
echo.
echo 🔧 Verificando dependencias del servidor...
if not exist "server\node_modules" (
    echo 📦 Instalando dependencias del servidor...
    cd server
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error al instalar dependencias del servidor
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Dependencias del servidor instaladas
) else (
    echo ✅ Dependencias del servidor ya están instaladas
)

:: Verificar dependencias del cliente
echo.
echo 🔧 Verificando dependencias del cliente...
if not exist "client\node_modules" (
    echo 📦 Instalando dependencias del cliente...
    cd client
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error al instalar dependencias del cliente
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Dependencias del cliente instaladas
) else (
    echo ✅ Dependencias del cliente ya están instaladas
)

:: Ejecutar pruebas del sistema
echo.
echo 🧪 Ejecutando pruebas del sistema...
node test-system.js
if %errorlevel% neq 0 (
    echo.
    echo ⚠️ Algunas pruebas fallaron. Revisa la configuración antes de continuar.
    echo.
    set /p continuar="¿Deseas continuar de todas formas? (s/n): "
    if /i not "%continuar%"=="s" (
        echo Sistema cancelado por el usuario.
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo 🎯 INICIANDO SISTEMA COMPLETO
echo ========================================
echo.
echo El sistema se iniciará en dos ventanas separadas:
echo   1. 🖥️  Servidor (Backend) - Puerto 5000
echo   2. 🌐 Cliente (Frontend) - Puerto 4000
echo.
echo ⏳ Iniciando en 3 segundos...
timeout /t 3 /nobreak >nul

:: Iniciar servidor en nueva ventana
echo 🚀 Iniciando servidor...
start "Servidor - Sistema de Gestión" cmd /k "cd /d %cd%\server && echo Iniciando servidor en puerto 5000... && npm start"

:: Esperar un momento para que el servidor se inicie
timeout /t 5 /nobreak >nul

:: Iniciar cliente en nueva ventana
echo 🌐 Iniciando cliente...
start "Cliente - Sistema de Gestión" cmd /k "cd /d %cd%\client && echo Iniciando cliente en puerto 4000... && npm start"

echo.
echo ========================================
echo ✅ SISTEMA INICIADO EXITOSAMENTE
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:4000
echo 🔌 Backend: http://localhost:5000
echo.
echo 💡 Para detener el sistema, cierra las ventanas del servidor y cliente
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
