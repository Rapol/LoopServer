import user from '../routes/user';
import survey from '../routes/survey';
import question from '../routes/question';

export default function routes(app){
  app.use('/users', user);
  app.use('/surveys', survey);
  app.use('/questions', question);
}