package ma.enset.ebankingbackend.web;

import lombok.AllArgsConstructor;
import ma.enset.ebankingbackend.dtos.DashboardDTO;
import ma.enset.ebankingbackend.services.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@AllArgsConstructor
//@CrossOrigin("*")
public class DashboardRestController {

    private final DashboardService dashboardService;

    @GetMapping
    public DashboardDTO getDashboard() {
        return dashboardService.getDashboardData();
    }
}