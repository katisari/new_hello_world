import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpService } from '../http.service';
import { ShareService } from '../share.service';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.css']
})
export class TextComponent implements OnInit {
  input_message = '';
  current_session_id = '';
  translatedText = "";
  constructor(
    private _httpService: HttpService,
    private _shareService: ShareService,
    private _route: ActivatedRoute,
    private _dashboard: DashboardComponent) { }

  ngOnInit() {
    this._route.parent.params.subscribe((params: Params) => {
      console.log(params);
      this.current_session_id = params.id;
      this._shareService.socket.emit('init_text');
      this._shareService.socket.on('receive_text', () => {
        this.updateChatBox();
        this._dashboard.updateTextBox();
      });
    });
  }
  sendText() {

    const curr_time = new Date();
    const source_lang = this._dashboard.lang_setting.lang_spoken.split('-')[0];

    const observable = this._httpService.getSingleSession(this.current_session_id);
    observable.subscribe((dataFromDB: any) => {
      console.log('Got a single session. Result:', dataFromDB);
      const new_msg = dataFromDB.data.chat_content + '<div class="row mb-2"><div class="col col-sm-3 text-right blue"><i class="fas fa-user-circle"></i> ' +
        this._shareService.my_user_name + ' </div><div class="col col-sm-7 px-4 py-2 bg-blue" style="border-radius:20px"> ' +
          this.input_message + '</div></div>';

          const observable3 = this._httpService.getTranslation(encodeURI(this.input_message), source_lang, this._dashboard.lang_setting.lang_to);
          observable3.subscribe(data => {
            this.translatedText = dataFromDB.data.translated_content + data['data']['translations'][0]['translatedText'] + ", " + curr_time.toLocaleTimeString() + ' (chat - ' + this._shareService.my_user_name + ') <br>';


            const observable2 = this._httpService.editSession(this.current_session_id, {chat_content: new_msg, translated_content:this.translatedText});
            console.log("My translated text",this.translatedText);
            observable2.subscribe((data2: any) => {
              
              console.log('Updated session. Result:', data2);
              this._shareService.socket.emit('send_text');
              this.input_message = '';
            });
            // this._dashboard.all_translations.push([data['data']['translations'][0]['translatedText'],
            // curr_time.toLocaleTimeString() + ' (chat - ' + this._shareService.my_user_name + ')']);
          });

    });
  }
  updateChatBox() {
    const observable = this._httpService.getSingleSession(this.current_session_id);
    observable.subscribe((data: any) => {
      console.log('Got a single session. Result:', data);
      document.getElementById('chat_box').innerHTML = data.data.chat_content;
    });
  }
}
