const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module');

let app;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.init();
  }
  return app;
}

module.exports = async (req, res) => {
  try {
    const nestApp = await bootstrap();
    const httpAdapter = nestApp.getHttpAdapter();
    const instance = httpAdapter.getInstance();

    return instance(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res
      .status(500)
      .json({ error: 'Internal Server Error', details: error.message });
  }
};
