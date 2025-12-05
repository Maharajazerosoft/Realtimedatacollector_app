import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
// import {CommonService} from '../common/common.service';
@Injectable({
  providedIn: 'root'
})
export class WebservicesService {
  public headers:any;
  // public uri = "http://nskfix.com/dev/surveyapp/newrestapi_multiple/webservices/";  // demo
  public uri = "https://www.realtimedatacollector.com/api/v2/webservices";  // live
  constructor(public http: HttpClient,
              private _httpClient: HttpClient,
              // public _commonService: CommonService
              ) {
  }
  uploadWebsitePicture(uploadurl:any, body:any) {
    const url = uploadurl;
    const response = this._httpClient.post(url, body);
    return response;
  }
    /**
     * Universal get
     *
     * @returns {Promise<any>}
     */
    getDataWithoutParam(controller:any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${this.uri}/`+controller, {
                headers:
                    new HttpHeaders(
                        {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        }
                    )
            }).subscribe((response: any) => {
                resolve(response);
                setTimeout(() => {
                }, 100);
            }, reject);
        });
    }
  /**
   * Universal get
   *
   * @returns {Promise<any>}
   */
  getData(controller:any, params:any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${this.uri}/`+controller+`?`+params, {
        headers:
            new HttpHeaders(
                {
                  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                }
            )
      }).subscribe((response: any) => {
        resolve(response);
        setTimeout(() => {
        }, 100);
      }, reject);
    });
  }
  /**
   * Universal post
   * @param params
   */
  postDataWithParam(controller:any, param:string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/`+controller+`?`+param, {...data}, {
        headers:
            new HttpHeaders(
                {
                  'Content-Type': 'application/x-www-form-urlencoded',
                }
            )
      })
          .subscribe((response: any) => {
            resolve(response);
          }, reject);
    });
  }
  /**
   * Universal post
   * @param params
   */
  // postData(controller:any, data: any): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._httpClient.post(`${this.uri}/`+controller, {...data}, {
  //       headers:
  //           new HttpHeaders(
  //               {
  //                 'Content-Type': 'application/x-www-form-urlencoded',
  //               }
  //           )
  //     })
  //         .subscribe((response: any) => {
  //           resolve(response);
  //         }, reject);
  //   });
  // }
  postData(controller: any, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${this.uri}/` + controller, data, {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
        })
      }).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error: any) => {
          if (error && error.status) {
            // Handle specific error status if needed
            console.error(`Error Status: ${error.status}`);
          } else {
            // Handle the case where error object is null or status is undefined
            console.error('An unknown error occurred');
          }
          reject(error);
        }
      );
    });
  }
}
