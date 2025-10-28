import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from '../schemas/message.schema';
import axios from 'axios';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  /**
   * Sauvegarder un message reçu dans MongoDB
   */
  async saveMessage(
    from: string,
    text: string,
    messageId: string,
    timestamp: string,
    rawData?: any,
  ): Promise<Message> {
    try {
      const message = new this.messageModel({
        from,
        text,
        messageId,
        timestamp,
        status: 'received',
        rawData,
      });

      const saved = await message.save();
      this.logger.log(`💾 Message sauvegardé (ID: ${messageId})`);
      return saved;
    } catch (error) {
      this.logger.error(`❌ Erreur sauvegarde : ${error.message}`);
      throw error;
    }
  }

  /**
   * Mettre à jour un message avec la réponse envoyée
   */
  async updateMessageResponse(
    messageId: string,
    response: string,
    status: string,
  ): Promise<void> {
    try {
      await this.messageModel.updateOne(
        { messageId },
        { $set: { response, status } },
      );
      this.logger.log(`✅ Message mis à jour (ID: ${messageId})`);
    } catch (error) {
      this.logger.error(`❌ Erreur mise à jour : ${error.message}`);
    }
  }

  /**
   * Envoyer un message WhatsApp via l'API Meta
   */
  async sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
    const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      this.logger.error('❌ WHATSAPP_TOKEN ou PHONE_NUMBER_ID manquant dans .env');
      return false;
    }

    try {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`📤 Message WhatsApp envoyé à ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Erreur envoi WhatsApp : ${error.response?.data || error.message}`);
      return false;
    }
  }

  /**
   * Récupérer tous les messages (pour debug ou admin)
   */
  async getAllMessages(limit: number = 50): Promise<Message[]> {
    return this.messageModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Récupérer les messages d'un utilisateur spécifique
   */
  async getMessagesByUser(phoneNumber: string): Promise<Message[]> {
    return this.messageModel
      .find({ from: phoneNumber })
      .sort({ createdAt: -1 })
      .exec();
  }
}