
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class AuthService{
    private isAuthenticated = false;
    private token: string;
    private authStatusListener = new Subject<boolean>();
    private tokenTimer: NodeJS.Timer;
    private userId: string;

    constructor(private http: HttpClient, private router: Router){} // create http client for call services 

    getToken(){
        return this.token;
    }
    getIsAuth(){
        return this.isAuthenticated;
    }
    getAuthStatusListener(){
        return this.authStatusListener.asObservable();
    }

    getUserId(){
        return this.userId;
    }
    createUser(email:string, password: string){
        const authData : AuthData = { email: email, password: password};
         this.http
            .post("http://localhost:3000/api/user/signup", authData)
            .subscribe(() => {
                this.router.navigate(['/']);
            }, error => {
                console.log(error);
                this.authStatusListener.next(false);
            });
    }


    login(email: string, password: string){
        const authData : AuthData = { email: email, password: password};
        this.http.post<{token:string, expiresIn:number,userId: string}>("http://localhost:3000/api/user/login", authData)
            .subscribe(response => {
                console.log(response);
                const token = response.token;
                this.token = token;
                if(token){
                    const expiresInDuration = response.expiresIn;
                    this.setAuthTime(expiresInDuration);
                    this.isAuthenticated = true;
                    this.userId = response .userId;
                    this.authStatusListener.next(true);
                    const now = new Date();
                    const expirationDate =new  Date(now.getTime() + expiresInDuration * 1000);
                    this.saveAuthData(token,expirationDate,this.userId);
                    this.router.navigate(['/']);
                }
                

        }, error => {
            this.authStatusListener.next(false);
        });

    }

    autoAuthUser(){
        const authInformation = this.getAuthData();
        if(!authInformation) return;
        const now = new Date();

        const expiresId = authInformation.expirationDate.getTime() - now.getTime();
        if(expiresId > 0){
            this.userId = authInformation.userId;
            this.token = authInformation.token;
            this.isAuthenticated = true;
            this.setAuthTime(expiresId / 1000);
            this.authStatusListener.next(true);
        }
    }
    logout(){
        this.token = null;
        this.userId = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        this.router.navigate(['/']);
        this.clearAuthData();
        clearTimeout(this.tokenTimer);
    }

    private setAuthTime(duration:number){
        this.tokenTimer= setTimeout(()=>{
            this.logout();
        },duration * 1000);
    }

    private saveAuthData(token: string, expirationDate: Date, userId: string){
        localStorage.setItem('token',token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('userId',userId);
    }

    private clearAuthData(){
        localStorage.removeItem("token");
        localStorage.removeItem("expiration");
        localStorage.removeItem("userId");
    }

    private getAuthData(){
        const token = localStorage.getItem("token");
        const userId= localStorage.getItem("userId");
        const expirationDate = localStorage.getItem("expiration");
        if(!token && !expirationDate){
            return;
        }
        return {
            token: token, 
            expirationDate: new Date(expirationDate),
            userId: userId
        };
    }
}