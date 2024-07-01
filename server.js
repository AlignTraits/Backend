// app.js
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const PORT = process.env.PORT || 3000; 
const CURRENTURL = process.env.BACKEND_URL || `http://localhost:${PORT || 3000}`

const whitelist = [...process.env['FRONTEND_URLS'].split(',')];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions));

// Swagger setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Allign Traits',
    version: '1.0.0',
    description: 'API documentation for the Alligned Traits Learning Management System',
  },
  servers: [
    {
      url: CURRENTURL,
      description: 'Online development server',
    },
    {
      url: `http://localhost:${PORT || 3000}`,
      description: 'Localhost development server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js', './models/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
app.get('/', (req, res) => res.redirect('/docs')); // Redirect to API docs if GET route
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/users', userRoutes);
app.use((req, res) => res.status(404).json({ message: 'Resource not found' })); // 404 Route


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}, LINK: ${CURRENTURL}`);
});
