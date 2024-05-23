// app.js
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Swagger setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'LMS API',
    version: '1.0.0',
    description: 'API documentation for the Learning Management System',
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: 'Development server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js', './models/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/users', userRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
