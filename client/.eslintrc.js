module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Deshabilitar reglas que no están definidas
    'destructuring-assignment': 'off',
    'promise/always-return': 'off',
    'promise/no-return-wrap': 'off',
    
    // Reglas básicas para nivel junior
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'react/prop-types': 'off'
  }
};