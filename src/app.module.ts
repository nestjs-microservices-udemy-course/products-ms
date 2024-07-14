import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ProductsModule } from './products/products.module';
import { prettyTarget } from './utils/pretty.target';

@Module({
  imports: [
    ProductsModule,
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: true,
        customAttributeKeys: {
          req: 'request',
          res: 'response',
          err: 'error',
        },
        transport: { target: prettyTarget },
      },
    }),
  ],
})
export class AppModule {}
