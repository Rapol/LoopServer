import user from '../routes/user';

export default function routes(app){
  app.use('/', user);
}