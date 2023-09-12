const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');
const helmet = require('helmet');
require('dotenv').config();
const connectDB = require('./config/db')

app.use(morgan('dev'));
app.use(helmet());
app.use(bodyParser.json());
app.use(express.json());
app.use(passport.initialize());
app.use(cors(
    {
        origin: '*',
        methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'x-access-token', 'X-Requested-With', 'Accept', 'Access-Control-Allow-Headers', 'Access-Control-Request-Headers', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Credentials'],
    }
));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).send("Hello World!");
});
app.use('/', require('./routes/auth'))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
const port = process.env.PORT
connectDB()
app.listen(port, () => {
    console.log('listening on port');
});
