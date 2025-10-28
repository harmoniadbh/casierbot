import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Type du document Message
export type MessageDocument = Message & Document;

// Schéma de la collection "messages"
@Schema({ timestamps: true }) // Ajoute automatiquement createdAt et updatedAt
export class Message {
  // Numéro de téléphone de l'expéditeur
  @Prop({ required: true, index: true })
  from: string;

  // Contenu du message reçu
  @Prop({ required: true })
  text: string;

  // ID unique du message WhatsApp
  @Prop({ required: true, unique: true })
  messageId: string;

  // Timestamp du message (fourni par WhatsApp)
  @Prop()
  timestamp: string;

  // Réponse automatique envoyée par le bot
  @Prop()
  response: string;

  // Statut du message
  @Prop({ 
    type: String, 
    enum: ['received', 'replied', 'failed'], 
    default: 'received' 
  })
  status: string;

  // Données brutes du webhook (optionnel, pour debug)
  @Prop({ type: Object })
  rawData?: any;
}

// Créer et exporter le schéma Mongoose
export const MessageSchema = SchemaFactory.createForClass(Message);

// Index pour optimiser les recherches
MessageSchema.index({ from: 1, createdAt: -1 });