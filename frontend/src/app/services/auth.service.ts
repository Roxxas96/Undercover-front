import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { User } from '../models/User.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuth$ = new BehaviorSubject<boolean>(false);
  token: string = '';
  userId: string = '';

  //http://localhost:3000/
  //https://play-undercover.herokuapp.com/
  host = 'http://localhost:3000/';

  constructor(private http: HttpClient) {}

  //CreateUser : call backend to create new user and return success/failures
  createUser(username: string, email: string, password: string) {
    return new Promise((resolve, reject) => {
      //Send HTTP request POST
      this.http
        .post(this.host + 'api/auth/signup', {
          username: username,
          email: email,
          password: password,
        })
        //Catch response
        .subscribe(
          (result) => {
            //And login
            this.login(email, password, false)
              .then(() => {
                resolve(null);
              })
              //Throw login errors
              .catch((error) => {
                console.log(error);
                reject(error);
              });
          },
          //Throw backend errors
          (error) => {
            console.log(error);

            reject(error);
          }
        );
    });
  }

  //Change password : call back for a password change
  changePassword(code: string, password: string) {
    return new Promise((resolve, reject) => {
      //POST
      this.http
        .post(this.host + 'api/auth/recover/' + code, {
          password: password,
        })
        //Catch
        .subscribe(
          (res) => {
            resolve(null);
          },
          //Throw
          (error) => {
            console.log(error);
            reject(error);
          }
        );
    });
  }

  //Login : call backend to fatch user provided info with DB and return success/failures
  login(login: string, password: string, autoConnect: boolean) {
    return new Promise((resolve, reject) => {
      //Send HTTP request POST
      this.http
        .post<{ userId: string; token: string }>(this.host + 'api/auth/login', {
          login: login,
          password: password,
        })
        //Catch response
        .subscribe(
          (authData: { userId: string; token: string }) => {
            //Store local info
            this.token = authData.token;
            this.userId = authData.userId;
            this.isAuth$.next(true);
            //Store session info
            sessionStorage.setItem('token', this.token);
            sessionStorage.setItem('userId', this.userId);
            //Store or delete localstorage vars
            switch (autoConnect) {
              case true: {
                localStorage.setItem('token', this.token);
                localStorage.setItem('userId', this.userId);
                break;
              }
              case false: {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
              }
            }

            resolve(null);
          },
          //Throw errors
          (error) => {
            console.log(error);

            reject(error);
          }
        );
    });
  }

  //Logout
  logout(forceLogout: boolean) {
    //Set local var
    this.userId = '';
    this.isAuth$.next(false);
    //Force logout mean widown close/refresh
    if (!forceLogout) {
      //Remove session + local var
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userId');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
    //Tell backen we disconnected
    this.http.get(this.host + 'api/auth/logout').subscribe(
      () => {
        this.token = '';
      },
      (error) => {
        console.log(error);
        if (error.status == 0) {
          error = { message: 'Serveur introuvable !' };
        }
        this.token = '';
      }
    );
  }

  //AuthRequest : fetch session info with backend to ensure that token hasn't expired
  authRequest() {
    return new Promise((resolve, reject) => {
      //HTTP request GET
      this.http
        //Provide userId (token is in header)
        .get(this.host + 'api/auth')
        .subscribe(
          (res) => {
            resolve(null);
          },
          //Catch errors (could be wrong token or other)
          (error) => {
            console.log(error);

            reject(error);
          }
        );
    });
  }

  //Get connected players : return an array of connected players, return type : Array<User> (see User.model for more info)
  getConnectedPlayers() {
    return new Promise<Array<User>>((resolve, reject) => {
      //HTTP request : GET
      this.http
        .get<{ result: Array<User> }>(this.host + 'api/auth/players')
        .subscribe(
          //Returned array is stored in result key
          (res: { result: Array<User> }) => {
            resolve(res.result);
          },
          //Catch errors
          (error) => {
            console.log(error);

            reject(error);
          }
        );
    });
  }

  //Recover password : call back to send an email for password recovery
  recoverPassword(email: string) {
    return new Promise((resolve, reject) => {
      //POST
      this.http
        .post(this.host + 'api/auth/recover', {
          email: email,
        })
        .subscribe(
          (res) => {
            resolve(null);
          },
          (error) => {
            console.log(error);
            reject(error);
          }
        );
    });
  }

  //Recover request : Call backend to chack if link code is valid
  recovertRequest(code: string) {
    return new Promise((resolve, reject) => {
      //GET
      this.http.get(this.host + 'api/auth/recover/' + code).subscribe(
        (res) => {
          resolve(null);
        },
        (error) => {
          console.log(error);
          reject(error);
        }
      );
    });
  }
}
