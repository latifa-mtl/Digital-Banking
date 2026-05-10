import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  errorMsg = '';
  loading = false;
  showPass = false;
  userFocused = false;
  passFocused = false;
  private returnUrl = '/dashboard';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // ✅ Use ngOnInit instead of constructor for redirect check
  //    avoids the double-click race condition
  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  login(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMsg = 'Please fill in both fields.';
      return;
    }
    this.loading = true;
    this.errorMsg = '';

    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = (err.status === 401 || err.status === 403)
          ? 'Invalid username or password.'
          : 'Server error. Is Spring Boot running?';
      }
    });
  }
}
