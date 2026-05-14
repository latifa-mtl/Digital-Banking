import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MarkdownComponent} from 'ngx-markdown';
import {HttpClient, HttpDownloadProgressEvent, HttpEventType} from '@angular/common/http';
@Component({
  selector: 'app-chat',
  imports: [FormsModule,
    MarkdownComponent],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  query : string ="";
  response : any ;
  progress : boolean = false;
  constructor(private http : HttpClient) {
  }
  askAgent() {
    this.response="";
    this.progress=true;
    this.http.get("http://localhost:8087/askAgent?query="+this.query,
      {responseType:'text', observe : 'events', reportProgress : true})
      .subscribe({
        next:evt => {
          if( evt.type === HttpEventType.DownloadProgress){
            this.response =  (evt as HttpDownloadProgressEvent).partialText
          }

        },
        error : err => {},
        complete :() => {
          this.progress = false;
        }
      })
  }
}
