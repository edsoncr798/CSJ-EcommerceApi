Voy a adaptar la función `nuevoUsuario` de C# a Node.js en el archivo `src/conteoDiario/services/user.service.js`.

**Plan de Implementación:**

1.  **Corregir la ruta de importación:**
    *   La ruta actual `../database/connection.js` es incorrecta. La cambiaré a `../../database/connection.js` para acceder correctamente a la conexión de base de datos.

2.  **Implementar la función `nuevoUsuario`:**
    *   Crearé una función asíncrona `nuevoUsuario` que acepte los parámetros: `nombre`, `documento`, `almacen`, `contraseña`, `key`.
    *   Usaré `getConnectionMeteloRapido` (como sugiere el archivo existente) para conectar a la base de datos.
    *   Configuraré los parámetros del Stored Procedure `NuevoUsuario` usando `sql.VarChar`.
    *   Ejecutaré el procedimiento almacenado y retornaré el primer resultado obtenido, replicando la lógica de C# (`sqlDr.GetString(0)`).
    *   Manejaré los errores con un bloque `try-catch`.

3.  **Exportar la nueva función:**
    *   Aseguraré que la función sea exportada para poder ser utilizada en otros archivos (controladores, rutas).

**Código resultante (vista previa):**
```javascript
export const nuevoUsuario = async (nombre, documento, almacen, password, key) => {
    // Lógica de conexión y ejecución del SP
}
```