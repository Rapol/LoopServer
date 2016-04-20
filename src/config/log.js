import bunyan from 'bunyan';

const app = bunyan.createLogger({
  name: 'app',
  serializers: {
    req: reqSerializer
  }
});

const user = bunyan.createLogger({
  name: 'user',
  serializers: {
    err: bunyan.stdSerializers.err,
  }
});

const survey = bunyan.createLogger({
  name: 'survey',
  serializers: {
    err: bunyan.stdSerializers.err,
  }
});

const question = bunyan.createLogger({
  name: 'question',
  serializers: {
    err: bunyan.stdSerializers.err,
  }
});

function reqSerializer(req) {
  return {
    method: req.method,
    url: req.url,
    authHeader: req.headers['authorization'],
    body: req.body
  };
}

export default {
  app,
  user,
  survey,
  question
}