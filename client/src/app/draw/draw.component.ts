import { Component, AfterViewInit, ViewChild,  ElementRef, ViewEncapsulation,OnInit } from '@angular/core';
import { HttpService } from '../http.service';
import { ActivatedRoute, Params } from '@angular/router';
import { ShareService } from '../share.service';
import { DashboardComponent } from '../dashboard/dashboard.component';
import * as MyScriptJS from 'myscript';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.css']
})
export class DrawComponent implements AfterViewInit, OnInit {
  current_session_id = '';
  constructor(
    private _httpService: HttpService,
    private _shareService: ShareService,
    private _route: ActivatedRoute,
    private _dashboard: DashboardComponent) { }
  ngOnInit() {
    this._route.parent.params.subscribe((params: Params) => {
      console.log(params);
      this.current_session_id = params.id;
      this._shareService.socket.on('receive_draw_video', () => {
        this._dashboard.updateTextBox();
      });
    });
  }
  @ViewChild('tref', {read: ElementRef}) domEditor: ElementRef;
  editor;
  ngAfterViewInit(): void {
    // your code
     console.log(this.domEditor.nativeElement);
     this.editor = MyScriptJS.register(this.domEditor.nativeElement, {
      recognitionParams: {
        type: 'TEXT',
        protocol: 'WEBSOCKET',
        apiVersion: 'V4',
        server: {
          scheme: 'https',
          host: 'webdemoapi.myscript.com',
          applicationKey: '4e867bfc-a2a3-4a31-92b4-4135141f65f9',
          hmacKey: 'fd7aa280-6cd1-48e0-915f-26c51638a11c',
        },
      },
    });
  }
  getExports() {
    // this.editor.export_((data) => {
    //   console.log(data);
    // });
    // this.txt = this.editor.export_();
    const observable = this._httpService.getSingleSession(this.current_session_id);
    observable.subscribe((dataFromDB: any) => {
      console.log('Got a single session. Result:', dataFromDB);
      
      const curr_time = new Date();
      const observable3 = this._httpService.getTranslation(this.editor.model.exports['text/plain'],
        'en', this._dashboard.lang_setting.lang_to);
      observable3.subscribe(data => {
        const translatedText = dataFromDB.data.translated_content + data['data']['translations'][0]['translatedText'] + ", " +
        curr_time.toLocaleTimeString() + ' (draw - ' + this._shareService.my_user_name + ') <br>';

        const observable2 = this._httpService.editSession(this.current_session_id, { translated_content: translatedText});
        console.log("My translated text",translatedText);
        observable2.subscribe((data2: any) => {
          
          console.log('Updated session. Result:', data2);
          this._shareService.socket.emit('send_draw_video');
        });
      });

    });
    // this._shareService.addText(this.editor.model.exports['text/plain']);
    // this._shareService.socket.emit('got_new_export');
  }

}
