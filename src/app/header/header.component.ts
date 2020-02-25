import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaederComponent implements OnInit, OnDestroy{
  constructor(private authService: AuthService){}

  private authListenerSubs: Subscription;
  userIsAuthanticated = false;
  ngOnInit(){
    this.userIsAuthanticated = this.authService.getIsAuth();
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthanticated => {
      this.userIsAuthanticated = isAuthanticated;
    });
  }

  onLogout(){
    this.authService.logout();
  }

  ngOnDestroy(){
    this.authListenerSubs.unsubscribe();
  }
}
