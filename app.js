import express from "express";
import cors from "cors";
import 'dotenv/config'
import AuthRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import cookieSession from "cookie-session";
import generateRandomString from "./utils/generateRandomString.js";
import path from 'path';
import {fileURLToPath} from 'url';
<<<<<<< HEAD

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8888;
const application = express();
if (process.env.NODE_ENV === 'production') {
	application.use(express.static('client/build'))
}
// Priority serve any static files.
=======

const PORT = process.env.PORT || 8888;
const application = express();

>>>>>>> 1f842f851198f114addb81958673df0087a11f42
application.use(cookieSession({
	name:'session',
	keys: [generateRandomString],

	maxAge: 24 * 60 * 60 * 1000 //24 hours

}))
application.use(cookieParser());
application.use(express.json());
application.use(express.urlencoded({ extended: true}));
application.use(cors({
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200
}));
application.use('/', cors(), AuthRoutes);

application.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
  });
application.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});

<<<<<<< HEAD

=======
if (process.env.NODE_ENV === 'production') {
	application.use(express.static('client/build'))
}
// All remaining requests return the React app, so it can handle routing.
>>>>>>> 1f842f851198f114addb81958673df0087a11f42
