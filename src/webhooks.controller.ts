import { 
  Controller,      //Permet de transformer une classe en contrôleur qui peut gérer des routes HTTP
  Get,            // Permet de créer une route GET (lecture ou vérification)
  Post,           // Permet de créer une route POST (souvent pour envoyer ou recevoir des données)
  Query,          // Pour récupérer les paramètres d'URL (?param=value)
  Body,           // Pour récupérer le corps de la requête (données JSON)
  HttpCode,       // Permet de spécifier le code HTTP de la réponse (200, 201, 403…)
  HttpStatus,     // Constantes des codes HTTP (200, 403, etc.)
  HttpException,  // Pour lancer des erreurs HTTP
  Logger          // Pour afficher des logs dans la console
} from '@nestjs/common';

// @Controller() → pas de chemin spécifié = la racine du serveur "/" 
@Controller()

// export : Rend la classe accessible depuis d'autres fichiers (nécessaire pour app.module.ts)
// class : Déclare une classe TypeScript orientée objet
// WebhooksController : Nom de la classe (convention : PascalCase + suffixe "Controller")
export class WebhooksController {

// Logger spécifique à cette classe pour afficher des messages dans la console
// private : Cette propriété est accessible UNIQUEMENT à l'intérieur de cette classe
//           Personne d'autre ne peut lire ou modifier ce logger
// readonly : Une fois initialisée, cette propriété ne peut plus être modifiée
//            Protection contre les modifications accidentelles
// logger : Nom de la variable (convention : camelCase)
// = : Opérateur d'affectation qui initialise la variable
// new Logger(...) : Crée une nouvelle instance de la classe Logger
// WebhooksController.name : Récupère le nom de la classe ("WebhooksController")
//                          Ce nom apparaîtra dans tous les logs pour identifier la source  
  private readonly logger = new Logger(WebhooksController.name);

  // Token de vérification récupéré depuis les variables d'environnement
  // Sert à sécuriser le webhook et valider que les requêtes viennent d'une source autorisée
  private readonly verifyToken = process.env.VERIFY_TOKEN;

  // Endpoint GET pour la vérification du webhook....Ce GET est appelé par le service externe pour confirmer que ton webhook est valide
  @Get()

  // verifyWebhook : Nom de la méthode (convention : camelCase, verbe à l'infinitif)
  // ( : Début de la liste des paramètres
  verifyWebhook(

    // @Query('hub.mode') : Décorateur qui extrait le paramètre d'URL nommé "hub.mode"
    //                      Si l'URL est ?hub.mode=subscribe, alors mode vaudra "subscribe"
    // mode: string : Paramètre de type chaîne de caractères
    //                : string = annotation de type TypeScript (vérifié à la compilation)
    @Query('hub.mode') mode: string,

    // @Query('hub.challenge') : Extrait le paramètre "hub.challenge" de l'URL
    //                           Meta envoie un code aléatoire qu'on doit renvoyer tel quel
    // challenge: string : Ce paramètre contiendra le code de vérification de Meta
    @Query('hub.challenge') challenge: string,

    // @Query('hub.verify_token') : Extrait le paramètre "hub.verify_token" de l'URL
    //                              C'est le token secret que Meta nous renvoie pour vérification
    // token: string : Ce paramètre contiendra le token envoyé par Meta
    //                 On va le comparer avec notre token stocké dans verifyToken
    @Query('hub.verify_token') token: string,
  ) {

    if (mode === 'subscribe' && token === this.verifyToken) {
      this.logger.log('✅ WEBHOOK VERIFIED');
      return challenge;
    } else {
      this.logger.error('❌ Webhook verification failed');
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  // Endpoint POST pour recevoir les événements
  @Post()
  @HttpCode(HttpStatus.OK)
  handleWebhook(@Body() body: any) {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    this.logger.log(`\n\n📩 Webhook received ${timestamp}\n`);
    this.logger.log(JSON.stringify(body, null, 2));
    return;
  }
}