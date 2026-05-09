import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  loggedIn = false;
  username = '';
  initials = '';
  private sub!: Subscription;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.refresh();
    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.refresh());
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  private refresh(): void {
    this.loggedIn = this.auth.isLoggedIn();
    if (this.loggedIn) {
      const p = this.auth.getProfile();
      if (p) {
        this.username = p.username;
        this.initials = p.username.slice(0, 2).toUpperCase();
      }
    }
  }

  logout(): void {
    this.auth.logout();
    this.loggedIn = false;
    this.username = '';
    this.initials = '';
    this.router.navigate(['/login']);
  }
}