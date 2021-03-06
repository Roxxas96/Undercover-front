import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  //Intercept every HTTP request and put the token in the headers
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.authService.token;
    const newRequest = request.clone({
      headers: request.headers.set('Authorization', 'Bearer ' + authToken),
    });
    return next.handle(newRequest);
  }
}
