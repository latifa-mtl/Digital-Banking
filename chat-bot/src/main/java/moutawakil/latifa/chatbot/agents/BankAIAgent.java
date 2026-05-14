package moutawakil.latifa.chatbot.agents;

import moutawakil.latifa.chatbot.tools.BankingTools;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

/**
 * @author admin
 **/
@Service
public class BankAIAgent {
    private final ChatClient chatClient;

    public BankAIAgent(ChatClient.Builder chatClientBuilder,
                       ChatMemory chatMemory,
                       BankingTools bankingTools,
                       VectorStore vectorStore) {

        this.chatClient = chatClientBuilder
                .defaultSystem("""
                        You are BankOS AI assistant.
                        
                        You help users understand:
                        - bank accounts
                        - debit and credit operations
                        - transfers
                        - saving accounts
                        - current accounts
                        
                        Answer only banking-related questions.
                        """)
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(chatMemory).build(),
                        new SimpleLoggerAdvisor(),
                        new QuestionAnswerAdvisor(vectorStore)
                )
                .defaultTools(bankingTools)
                .build();
    }

    public Flux<String> ask(String query) {

        return chatClient.prompt()
                .user(query)
                .stream()
                .content();
    }
}
