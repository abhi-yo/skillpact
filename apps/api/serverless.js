const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module');

let app;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    await app.init();
  }
  return app;
}

module.exports = async (req, res) => {
  const nestApp = await bootstrap();
  return nestApp.getHttpAdapter().getInstance()(req, res);
};
