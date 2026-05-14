package moutawakil.latifa.chatbot.tools;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
/**
 * @author admin
 **/
@Service
public class BankingTools {
    private final RestTemplate restTemplate;

    public BankingTools() {
        this.restTemplate = new RestTemplate();
    }

    @Tool(description = "Get bank account balance")
    public String getAccountBalance(
            @ToolParam(description = "Bank account ID")
            String accountId
    ) {

        try {

            String url =
                    "http://localhost:8080/accounts/" + accountId;

            Map response =
                    restTemplate.getForObject(url, Map.class);

            return "The balance is "
                    + response.get("balance")
                    + " MAD";

        } catch (Exception e) {

            return "Account not found";
        }
    }

    @Tool(description = "Get customer information")
    public String getCustomerInfo(
            @ToolParam(description = "Customer ID")
            Long customerId
    ) {

        try {

            String url =
                    "http://localhost:8080/customers/" + customerId;

            Map response =
                    restTemplate.getForObject(url, Map.class);

            return response.toString();

        } catch (Exception e) {

            return "Customer not found";
        }
    }

    @Tool(description = "Explain debit operation")
    public String explainDebit() {

        return """
                A debit operation removes money from a bank account.
                The account balance decreases after the operation.
                """;
    }

    @Tool(description = "Explain credit operation")
    public String explainCredit() {

        return """
                A credit operation adds money to a bank account.
                The account balance increases after the operation.
                """;
    }
}
