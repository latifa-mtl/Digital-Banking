package moutawakil.latifa.chatbot.controllers;

import moutawakil.latifa.chatbot.agents.BankAIAgent;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin("*")
public class AgentController {
    private final BankAIAgent bankAIAgent;

    public AgentController(BankAIAgent bankAIAgent) {
        this.bankAIAgent = bankAIAgent;
    }

    @GetMapping(value = "/chat", produces = MediaType.TEXT_PLAIN_VALUE)
    public Flux<String> chat(@RequestParam String query) {

        return bankAIAgent.ask(query);
    }
}
