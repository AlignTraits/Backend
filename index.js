// app.js
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import waitistRoutes from './routes/waitistRoutes.js';
import path from 'path';

dotenv.config();

const PORT = process.env.PORT || 3000; 
const HOST = process.env.BACKEND_URL || `http://localhost:${PORT}`

const whitelist = [...process.env['FRONTEND_URLS'].split(','), HOST];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  }
};

const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(express.static(path.join('public')));
// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join('views'));

// Swagger specifications
const swaggerSpec = swaggerJSDoc({
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Allign Traits',
      version: '1.0.0',
      description: 'API documentation for the AlignTraits Backend system',
    },
    servers: [
      {
        url: HOST,
        description: 'Online development server',
      },
      {
        url: `http://localhost:${PORT || 3000}`,
        description: 'Localhost development server',
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js'],
});

app.get('/', (req, res) => res.redirect('/docs')); // Redirect to API docs if GET route accessed
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/waitlist', waitistRoutes);
app.use((req, res) => res.status(404).json({ message: 'Resource not found' })); // 404 Route


// Start the server
app.listen(PORT, () => {
  console.log(`Server host: ${HOST}\nCORS allowed: ${whitelist.map((url) => `\n- ${url}`)}`);
});
