import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from './components/navbar/navbar';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Navbar],
  template: `
    <div class="layout-wrapper">
      <app-navbar *ngIf="isLoggedIn"></app-navbar>
      <div [class]="isLoggedIn ? 'main-content' : 'w-100'">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class App implements OnInit {
  isLoggedIn = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }
}