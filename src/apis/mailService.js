const mailjet = require('node-mailjet')
const { format } = require('date-fns');
require('dotenv').config();
const mailjetClient = mailjet.apiConnect(
    process.env.MAILJET_PUBLIC_KEY,
    process.env.MAILJET_SECRET_KEY
);

const sendCartEmail = async (email, name, cartDetails, pdfLink) => {
    const { productos, subtotal, iva, total } = cartDetails;

    const currentDate = format(new Date(), 'dd/MM/yyyy'); 

    const emailData = {
        Messages: [
            {
                From: {
                    Email: "@ittepic.edu.mx",
                    Name: "PrestaShop",
                },
                To: [
                    {
                        Email: email,
                        Name: name,
                    },
                ],
                Subject: `Detalles del carrito de compras (${currentDate})`,
                HTMLPart: `
                   <html>
    <head>
        <style>
            body {
                font-family: 'Verdana', sans-serif;
                background-color: #e9ecef;
                color: #212529;
                padding: 20px;
                margin: 0;
            }
            .email-wrapper {
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                padding: 30px;
                max-width: 650px;
                margin: 0 auto;
            }
            h1 {
                font-size: 24px;
                color: #007bff;
                margin-bottom: 15px;
                text-align: center;
            }
            p {
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 15px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
                margin-bottom: 15px;
            }
            th, td {
                padding: 12px;
                text-align: left;
                border: 1px solid #dee2e6;
            }
            th {
                background-color: #f8f9fa;
                color: #495057;
            }
            .total-box {
                margin-top: 20px;
                padding: 15px;
                background-color: #007bff;
                color: #ffffff;
                border-radius: 8px;
                font-size: 20px;
                font-weight: bold;
                text-align: center;
            }
            .cta {
                text-align: center;
                margin-top: 20px;
            }
            .cta a {
                display: inline-block;
                text-decoration: none;
                background-color: #007bff;
                color: #ffffff;
                padding: 10px 20px;
                border-radius: 5px;
                font-weight: bold;
            }
            .cta a:hover {
                background-color: #0056b3;
            }
            .footer {
                text-align: center;
                font-size: 14px;
                color: #868e96;
                margin-top: 20px;
            }
            .footer a {
                color: #007bff;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <h1>¡Tu compra está confirmada, ${name}!</h1>
            <p>Gracias por confiar en nosotros. A continuación, encontrarás un resumen de los detalles de tu compra:</p>
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                    </tr>
                </thead>
                <tbody>
                    ${productos
                        .map(
                            (p) =>
                                `<tr>
                                    <td>${p.producto.name}</td>
                                    <td>${p.cantidad}</td>
                                    <td>$${p.producto.price.toFixed(2)}</td>
                                </tr>`
                        )
                        .join("")}
                </tbody>
            </table>
            <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
            <p><strong>IVA:</strong> $${iva.toFixed(2)}</p>
            <div class="total-box"><strong>Total a pagar:</strong> $${total.toFixed(2)}</div>
            <div class="cta">
                <p>Consulta el detalle completo de tu compra en el siguiente enlace:</p>
                <a href="${pdfLink}" target="_blank">Descargar Factura PDF</a>
            </div>
            <p>Si tienes alguna pregunta, no dudes en contactarnos. ¡Esperamos verte de nuevo pronto!</p>
            <div class="footer">
                <p>¿Dudas? <a href="mailto:support@tutienda.com">Contáctanos aquí</a>.</p>
            </div>
        </div>
    </body>
</html>

                `,
            },
        ],
    };

    try {
        const response = await mailjetClient.post("send", { version: "v3.1" }).request(emailData);
    } catch (error) {
        console.error("Error al enviar el correo:", error.message);
    }
};

module.exports = { sendCartEmail };
