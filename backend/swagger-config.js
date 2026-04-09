const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AgriCargas API',
            version: '1.0.0',
            description: 'API de documentação para o aplicativo AgriCargas',
            contact: {
                name: 'Suporte AgriCargas',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Servidor Local',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./server.js'], // Caminho para onde estão as anotações
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs,
};
