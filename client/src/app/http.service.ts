import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  all_content = [];
  API_KEY = "";
  constructor(private _http: HttpClient) {}
  // Session Services
  getSessions() {
    return this._http.get('/sessions');
  }
  getSingleSession(id) {
    return this._http.get(`/sessions/${id}`);
  }
  addSession(new_session) {
    return this._http.post('/sessions', new_session);
  }
  editSession(id, updated_session) {
    return this._http.put(`/sessions/${id}`, updated_session);
  }
  deleteSession(id) {
    return this._http.delete(`/sessions/${id}`);
  }
  // User Services
  addUser(id, new_user) {
    return this._http.post(`/users/${id}`, new_user);
  }
  deleteUser(id, sid) {
    return this._http.delete(`/users/${id}/${sid}`);
  }
  getTranslation(input_words, source_lang, output_lang) {
    return this._http.get
    (`https://translation.googleapis.com/language/translate/v2?target=${output_lang}&source=${source_lang}&key=${this.API_KEY}&q=${input_words}`);
  }
}
