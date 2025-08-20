import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER_BASE,
        pass: process.env.EMAIL_PASSWORD.trim()
    },
    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify(function(error, success){
    if (error) {
        console.log("Error en la configuración del email:", error);
    } else {
        console.log("Servidor listo para enviar emails");
    }
});


export const sendVerificationEmail = async (email, verificationLink) => {
    try{
        const mailOptions = {
            from: `"Ecommerce CSJ" <${process.env.EMAIL_USER_BASE}>`,
            to: email,
            subject: 'Verificación de correo electrónico',
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>¡Bienvenido!</h2>
                    <p>Gracias por registrarte. Por favor, verifica tu cuenta haciendo clic en el siguiente enlace:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" 
                           style="background-color: #4CAF50; 
                                  color: white; 
                                  padding: 12px 20px; 
                                  text-decoration: none; 
                                  border-radius: 5px;">
                            Verificar mi cuenta
                        </a>
                    </div>
                    <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
                    <p>${verificationLink}</p>
                    <p>Este enlace expirará en 1 hora.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return true;
    }catch(error){
        console.error('Error al enviar el correo de verificación:', error);
        throw error;
    }
}


export const sendPurchaseConfirmationEmail = async (orderData) => {
    try {
        const mailOptions = {
            from: `"Ecommerce CSJ" <${process.env.EMAIL_USER_BASE}>`,
            to: orderData.Email,
            subject: 'Confirmación de Compra - Ecommerce CSJ',
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <img src="https://res.cloudinary.com/dtenasiya/image/upload/v1749753031/csj-productImages/logo.png" alt="Logo Comercializadora San Juan" style="max-width: 200px; height: auto;">
                    </div>
                    <h2 style="color: #333; text-align: center;">¡Gracias por tu compra!</h2>
                    <p style="color: #666; text-align: center; margin-bottom: 30px;">
                        Estimado cliente, agradecemos tu preferencia. Tu confianza nos impulsa a seguir mejorando día a día.
                        Hemos procesado tu pedido con éxito y aquí encontrarás todos los detalles de tu compra.
                    </p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #28a745;">Detalles de la Orden</h3>
                        <p><strong>Número de Orden:</strong> ${orderData.order_id}</p>
                        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Estado:</strong> Completado</p>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <thead>
                            <tr style="background-color: #28a745; color: white;">
                                <th style="padding: 10px; text-align: left;">Producto</th>
                                <th style="padding: 10px; text-align: center;">Cantidad</th>
                                <th style="padding: 10px; text-align: right;">Precio Unit.</th>
                                <th style="padding: 10px; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orderData.items.map(item => `
                                <tr style="border-bottom: 1px solid #ddd;">
                                    <td style="padding: 10px;">
                                        <div>
                                            <strong>${item.Descripcion}</strong>
                                        </div>
                                    </td>
                                    <td style="padding: 10px; text-align: center;">${item.Cantidad}</td>
                                    <td style="padding: 10px; text-align: right;">S/ ${item.Precio.toFixed(2)}</td>
                                    <td style="padding: 10px; text-align: right;">S/ ${item.Total.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr style="background-color: #f8f9fa;">
                                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                                <td style="padding: 10px; text-align: right;"><strong>S/ ${orderData.TotalVenta.toFixed(2)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <div style="text-align: center; color: #666; margin-top: 30px;">
                        <p>Si tienes alguna pregunta sobre tu compra, no dudes en contactarnos:</p>
                        <p style="margin: 5px 0;">📞 Teléfono: (01) 695-1023</p>
                        <p style="margin: 5px 0;">✉️ Email: ventasweb@comsanjuan.com</p>
                        <p style="margin: 5px 0;">🌐 Web: www.comsanjuan.com</p>
                    </div>
                    <div style="border-top: 2px solid #28a745; margin-top: 30px; padding-top: 20px; text-align: center;">
                        <p style="color: #28a745; font-weight: bold;">¡Síguenos en nuestras redes sociales!</p>
                        <div style="margin-top: 10px;">
                            <a href="https://www.facebook.com/comsanjuansac" style="text-decoration: none; margin: 0 10px;">Facebook</a>
                            <a href="https://www.instagram.com/comsanjuansac" style="text-decoration: none; margin: 0 10px;">Instagram</a>
                        </div>
                        <p style="font-size: 12px; color: #666; margin-top: 20px;">
                            © ${new Date().getFullYear()} Comercializadora San Juan SAC. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error al enviar el correo de confirmación de compra:', error);
        throw error;
    }
}