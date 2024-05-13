import App from '@/app';
import { IndexController } from '@controllers/index.controller';
import validateEnv from '@utils/validateEnv';
import { UserController } from './controllers/user.controller';
import { DocumentController } from './controllers/document.controller';
import { PartyController } from './controllers/party.controller';

validateEnv();

const app = new App([IndexController, UserController, DocumentController, PartyController]);

app.listen();
