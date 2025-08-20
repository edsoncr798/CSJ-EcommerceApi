import { consultDocumentService, validateDocumentFromDB, validatePersonaService } from '../services/document.service.js';

export const consultDocument = async (req, res) => {
    try {
        const { document } = req.params;
        const result = await consultDocumentService(document);
        
        res.json(result); 
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message || 'Error al consultar el documento'
        });
    }
}; 



export const validateDocument = async (req, res) => {
    const { doc } = req.params;

    try {

        console.log(`document received: ${doc}`);
        const result = await validateDocumentFromDB(doc)
        console.log(`Result from DB: `, result);    

    if (result.recordset && result.recordset.length > 0) {
        return res.json({
            success: true,
            isPerson: result.recordset[0].IsPerson === 1,
            isClient: result.recordset[0].IsClient === 1,
        });
    } else {
        return res.json({
            success: true,
            isPerson: false,
            isClient: false,
        });
    }
    } catch (error) {
        console.error('Error al validar DNI:', error);
        return res.status(500).json({ success: false, error: 'Error en la validación' });
    }
};


export const validatePersona = async (req, res) => {
    try {
        const { dni, codigo } = req.params;
        
        console.log(`Validando persona - DNI: ${dni}, Código: ${codigo}`);
        const result = await validatePersonaService(dni, codigo);
        console.log('Resultado de validación de persona:', result);
        
        return res.json(result);
    } catch (error) {
        console.error('Error al validar persona:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Error en la validación de persona' 
        });
    }
};
