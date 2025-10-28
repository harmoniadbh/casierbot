import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhooksController } from './webhooks.controller';
import { MessageService } from './services/message.service';
import { Message, MessageSchema } from './schemas/message.schema';

@Module({
  imports: [
    // Configuration des variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Connexion à MongoDB Atlas
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    
    // Enregistrer le schéma Message pour l'utiliser dans l'app
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema }
    ]),
  ],
  controllers: [WebhooksController],
  providers: [MessageService], // Ajouter le service
})
export class AppModule {}