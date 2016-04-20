import user from '../routes/user';
import survey from '../routes/survey';
import question from '../routes/question';

export default function routes(app){
  app.use('/user', user);
  app.use('/survey', survey);
  app.use('/question', question);
}