const puppeteer = require('puppeteer');
const bucket = require('../apis/firebaseConfig');

const generateCartPdf = async (email, name, cartDetails) => {
    const { productos, subtotal, iva, total } = cartDetails;

    // Obtener la fecha y hora actual
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const formattedTime = today.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    // Formato para el nombre del archivo con fecha y hora
    const fileName = `carrito_${name}_${formattedDate.replace(/ /g, "_").replace(/,/g, "")}_${formattedTime.replace(/:/g, "-")}.pdf`;

    // Contenido HTML para el PDF
    const htmlContent = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; padding: 40px; max-width: 700px; margin: 0 auto; border-radius: 12px; border: 1px solid #e0e0e0;">
    <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
        <h1 style="font-size: 24px; color: #333333; margin-bottom: 10px;">¡Gracias por tu compra, ${name}!</h1>
        <p style="font-size: 14px; color: #555555;">Fecha: ${formattedDate} | Hora: ${formattedTime}</p>
    </div>

    <div style="margin-top: 20px;">
        <h2 style="font-size: 18px; color: #333333; border-bottom: 2px solid #2196f3; display: inline-block; padding-bottom: 5px;">Detalles del pedido</h2>
        <div style="margin-top: 15px;">
            ${productos.map(p => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                    <div style="flex: 2; font-size: 14px; color: #555555;">${p.producto.name}</div>
                    <div style="flex: 1; text-align: center; font-size: 14px; color: #555555;">x${p.cantidad}</div>
                    <div style="flex: 1; text-align: right; font-size: 14px; color: #333333; font-weight: bold;">$${p.producto.price.toFixed(2)}</div>
                </div>
            `).join('')}
        </div>
    </div>

    <div style="margin-top: 20px; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
        <p style="font-size: 14px; color: #555555; margin: 5px 0;"><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
        <p style="font-size: 14px; color: #555555; margin: 5px 0;"><strong>IVA:</strong> $${iva.toFixed(2)}</p>
        <p style="font-size: 18px; color: #2196f3; font-weight: bold; margin: 15px 0;"><strong>Total:</strong> $${total.toFixed(2)}</p>
    </div>
</div>
    `;


    // Lanzar Puppeteer y generar el PDF en memoria
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    // Generar el PDF como un buffer en memoria
    const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
            top: "10mm",
            right: "20mm",
            bottom: "20mm",
            left: "20mm",
        },
    });

    await browser.close();

    // Subir el buffer a Firebase Storage
    const file = bucket.file(`facturapi/${fileName}`);
    await file.save(pdfBuffer, {
        metadata: {
            contentType: 'application/pdf',
        },
    });

    // Obtener el enlace público
    const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2030', // Fecha de expiración
    });

    return url; // Regresar la URL del archivo en Firebaseetorna el enlace público del archivo
};

module.exports = { generateCartPdf };
