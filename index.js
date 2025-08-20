import app, { configureSocketIO } from "./src/app.js";
import { PORT } from "./src/config/config.js";
import bodyParser from "body-parser";
import { createServer } from "http";
// import { desactivarProductosDesdeArchivo } from "./src/desactivarProductos.js";
// import { activarTelefonosDesdeArchivo } from "./src/activarTelefonos.js";
// import './jobs/checkPendingPayments.js'
// import {updateProductCategory, updateProductImages} from "./src/updateProductImages.js";

app.use(bodyParser.json());

const server = createServer(app);

const io = configureSocketIO(server);

export { io };
// updateProductImages()
// updateProductCategory()
// activarTelefonosDesdeArchivo('./data/codigosPersona.txt')

// Ejecutar la función de desactivar productos
// desactivarProductosDesdeArchivo('./data/codigos.txt', 58)
//     .then(resultado => {
//         console.log('Desactivación completada:', resultado);
//     })
//     .catch(error => {
//         console.error('Error en desactivación:', error);
//     });


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

