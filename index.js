const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');
const helmet = require('helmet');
require('dotenv').config();
const connectDB = require('./config/db');
app.use(morgan('dev'));
app.use(helmet());
app.use(passport.initialize());
app.use(express.json());
app.use(cors(
    {
        origin: '*',
        methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'x-access-token', 'X-Requested-With', 'Accept', 'Access-Control-Allow-Headers', 'Access-Control-Request-Headers', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Credentials'],
    }
));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use('/', require('./routes/user'));
const port = process.env.PORT;
connectDB();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
