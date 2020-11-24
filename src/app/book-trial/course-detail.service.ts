import { Course } from './course';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseDetailService {
  private _url = "http://localhost:3000/api";
  constructor(private _http: HttpClient) {
  }

  getAvilableCourses():Observable<Course[]>{
    return this._http.get<Course[]>("https://script.google.com/macros/s/AKfycbzJ8Nn2ytbGO8QOkGU1kfU9q50RjDHje4Ysphyesyh-osS76wep/exec");
  }

  bookTrial(data){
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      });
    let body = JSON.stringify(data);
    console.log(body)
    return this._http.post(this._url+'/bookTrial', body, {headers:headers});
  }
  

}
