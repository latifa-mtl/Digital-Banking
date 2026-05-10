package ma.enset.ebankingbackend.security;

/**
 * @author admin
 **/

import ma.enset.ebankingbackend.entities.AppUser;
import ma.enset.ebankingbackend.repositories.AppUserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class SecurityController {

    private final AuthenticationManager authenticationManager;

    private final JwtEncoder jwtEncoder;
    private AppUserRepository userRepository;
    private PasswordEncoder passwordEncoder;

    public SecurityController(AuthenticationManager authenticationManager,
                              JwtEncoder jwtEncoder,AppUserRepository userRepository,PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtEncoder = jwtEncoder;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/profile")
    public Authentication authentication(Authentication authentication) {
        return authentication;
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        Instant instant = Instant.now();

        String scope = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));

        JwtClaimsSet jwtClaimsSet = JwtClaimsSet.builder()
                .issuedAt(instant)
                .expiresAt(instant.plus(10, ChronoUnit.MINUTES))
                .subject(request.getUsername())
                .claim("scope", scope)
                .build();

        String token = jwtEncoder.encode(
                JwtEncoderParameters.from(
                        JwsHeader.with(MacAlgorithm.HS512).build(),
                        jwtClaimsSet
                )
        ).getTokenValue();

        return Map.of(    "accessToken", token,
                "username", request.getUsername(),
                "roles", String.valueOf(authentication.getAuthorities()
                        .stream()
                        .map(a -> a.getAuthority())
                        .toList()));
    }

    
}
