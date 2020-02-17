import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

import { ApiAiClient } from 'api-ai-javascript/es6/ApiAiClient';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class Message {
  constructor(public content: string, public sendBy: string){}
}


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  token = environment.dialogflow.angularBot;
  client = new ApiAiClient({accessToken: this.token });

  conversation = new BehaviorSubject<Message[]>([]);

  constructor() { }

  update(msg: Message){
    this.conversation.next([msg]);
  }

  converse(msg: string){
    const userMessage = new Message(msg, 'user');
    this.update(userMessage);

    return this.client.textRequest(msg)
               .then(res =>{
                 const speech = res.result.fulfillment.speech;
                 const botMessage = new Message(speech, 'bot');
                 this.update(botMessage);
               });
  }

  // talk(){
  //   this.client.textRequest('who are you!').then(res => console.log(res));
  // }
}
