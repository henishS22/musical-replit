import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { raw } from 'body-parser';
import { AppModule } from './app.module';
import { ErrorsInterceptor } from './interceptors/errors.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { CronJob } from 'cron';
import { CoinflowService } from './coinflow/coinflow.service';
import { PostsService } from './ayrshare/services/posts.services';
import { LiveStreamService } from './stream/stream.service';

function bootstrapSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Musical API Documentation')
    .setDescription(
      'Documentation of the interval Musical API to be used by the web and mobile applications',
    )
    .setVersion('1.0')
    .build();

  const {
    API_DOCS_USERNAME: apiDocsUsername,
    API_DOCS_PASSWORD: apiDocsPassword,
  } = process.env;
  const hasAuthenticationConfig =
    apiDocsUsername &&
    apiDocsPassword &&
    apiDocsUsername !== '' &&
    apiDocsPassword !== '';

  if (hasAuthenticationConfig) {
    app.use(
      ['/docs'],
      basicAuth({
        challenge: true,
        users: {
          [apiDocsUsername]: apiDocsPassword,
        },
      }),
    );
  }

  const customCss = `
        .topbar-wrapper img {
          content: url(\'../assets/logo.svg\');
          width: 200px;
          height: auto;
        }

        .swagger-ui .topbar {
          background-color: #FFFFFF;
        }

        .topbar-wrapper {
          justify-content: center;
        }`;

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customCss,
  });
}

process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err);
  process.exit(1); // Mandatory (as per the Node.js docs)
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
  process.exit(1);
});

async function bootstrap() {
  const logger = new Logger();

  //Create nest app object
  const app = await NestFactory.create(AppModule);

  //Define interceptors
  app.useGlobalInterceptors(
    app.get(ErrorsInterceptor),
    new TransformInterceptor(),
  );

  //Add the validation pipe to the global pipes
  //whitelist: remove all properties that are not in the DTO's files
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  //Enabled redis to be closed on application shutdown
  app.enableShutdownHooks();

  //Set cors enabled option
  app.enableCors({ origin: true });
  app.use('/notifies/events', raw({ type: 'application/json' }));

  // Swagger
  bootstrapSwagger(app);

  // Get CoinflowService instance
  const coinflowService = app.get(CoinflowService);
  const postService = app.get(PostsService)
  const streamService = app.get(LiveStreamService)
  // Create cron job to run subscription reassignment every day at midnight
  const subscriptionCronJob = new CronJob(
    '0 0 * * *', // Run at midnight every day
    async () => {
      try {
        logger.log('Running subscription reassignment task...');
        await coinflowService.inaciveAndReassignSubscriptions();
        logger.log('Running remove scheduled media task...')
        await postService.removeScheduledMedia();
      } catch (error) {
        logger.error('Error in subscription reassignment task:', error);
      }
    },
    null, // onComplete
    false, // start
    'UTC', // timeZone
  );

  // Create cron job to run find expire stream and status update
  const streamCronJob = new CronJob(
    '2,32 * * * *',
    async () => {
      try {
        logger.log('Running stream assignment task...');
        await streamService.statusUpdateExpireStreams();
      } catch (error) {
        logger.error('Error in stream assignment task:', error);
      }
    },
    null, // onComplete
    false, // start
    'UTC', // timeZone
  );

  // Start the cron job
  subscriptionCronJob.start();
  streamCronJob.start();
  logger.log('Subscription reassignment cron job started');

  // Enable shutdown hooks with proper cleanup
  app.enableShutdownHooks(['SIGTERM', 'SIGINT']);

  // Add cleanup on application shutdown
  app.getHttpServer().on('close', () => {
    subscriptionCronJob.stop();
    streamCronJob.stop();
    logger.log('Subscription reassignment cron job stopped');
  });

  //Listen to the port
  await app.listen(3001);
  logger.log('\n\nThe api-gateway is listening\n\n');
}
bootstrap();
