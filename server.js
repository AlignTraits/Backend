// app.js

import express from 'express';

import bodyParser from 'body-parser';

import dotenv from 'dotenv';

import swaggerUi from 'swagger-ui-express';

import swaggerJSDoc from 'swagger-jsdoc';

import cors from 'cors';

import userRoutes from './routes/userRoutes.js';



dotenv.config();



const whitelist = ['http://localhost:4200', 'https://learn-connect-7c84a.web.app/'];



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

app.get('/', (req, res) => res.redirect('/docs'));