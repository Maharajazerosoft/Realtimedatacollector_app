import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AutoCompleteService } from 'ionic4-auto-complete';

@Injectable({
  providedIn: 'root'
})
export class AddressCompleteService implements AutoCompleteService {
  labelAttribute = 'address';
  response: any;
  
  constructor(private http: HttpClient) {
  }

  getResults(keyword: string) {
    if (!keyword) { return false; }

    // let url = 'http://nskfix.com/dev/surveyapp/index.php?address=';
    let url = 'http://realtimedatacollector.com/multiple/address/index.php?address=';

    return this.http.get(url + keyword).pipe(
      map((result: any) => {
        if (result.status == "success") {
          this.response = result.data;
        }
        return this.response;
      })
    );
  }
}