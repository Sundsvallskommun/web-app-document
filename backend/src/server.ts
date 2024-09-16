import App from '@/app';
import { IndexController } from '@controllers/index.controller';
import validateEnv from '@utils/validateEnv';
import { UserController } from './controllers/user.controller';
import { DocumentController } from './controllers/document.controller';
import { PartyController } from './controllers/party.controller';
import { MunicipalityController } from './controllers/municipality.controller';

validateEnv();

const app = new App([IndexController, UserController, DocumentController, PartyController, MunicipalityController]);

app.listen();
