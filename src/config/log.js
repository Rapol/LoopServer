import bunyan from 'bunyan';

const app = bunyan.createLogger({
  name: 'loop',
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

function reqSerializer(req) {
  return {
    method: req.method,
    url: req.url,
    body: req.body
  };
}

export default {
  app,
  user
}