import user from '../routes/user';
import survey from '../routes/survey';

export default function routes(app){
  app.use('/user', user);
  app.use('/survey', survey);
}