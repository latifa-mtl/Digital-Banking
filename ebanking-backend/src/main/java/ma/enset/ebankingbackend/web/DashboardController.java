package ma.enset.ebankingbackend.web;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import ma.enset.ebankingbackend.entities.AccountOperation;
import ma.enset.ebankingbackend.entities.BankAccount;
import ma.enset.ebankingbackend.entities.CurrentAccount;
import ma.enset.ebankingbackend.entities.SavingAccount;
import ma.enset.ebankingbackend.enums.OperationType;
import ma.enset.ebankingbackend.repositories.AccountOperationRepository;
import ma.enset.ebankingbackend.repositories.BankAccountRepository;
import ma.enset.ebankingbackend.repositories.CustomerRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * @author admin
 **/
@RestController
@AllArgsConstructor
@RequestMapping("/dashboard")
public class DashboardController {

    private final CustomerRepository customerRepository;
    private final BankAccountRepository accountRepository;
    private final AccountOperationRepository operationRepository;


    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        List<BankAccount> accounts = accountRepository.findAll();
        List<AccountOperation> operations = operationRepository.findAll();

        double totalBalance = accounts.stream()
                .mapToDouble(BankAccount::getBalance)
                .sum();

        double totalCredits = operations.stream()
                .filter(o -> o.getOperationType() == OperationType.CREDIT)
                .mapToDouble(AccountOperation::getAmount)
                .sum();

        double totalDebits = operations.stream()
                .filter(o -> o.getOperationType() == OperationType.DEBIT)
                .mapToDouble(AccountOperation::getAmount)
                .sum();

        long totalCurrentAccounts = accounts.stream()
                .filter(a -> a instanceof CurrentAccount)
                .count();

        long totalSavingAccounts = accounts.stream()
                .filter(a -> a instanceof SavingAccount)
                .count();

        return Map.of(
                "totalCustomers",       customerRepository.count(),
                "totalAccounts",        accounts.size(),
                "totalOperations",      operations.size(),
                "totalBalance",         totalBalance,
                "totalCredits",         totalCredits,
                "totalDebits",          totalDebits,
                "totalCurrentAccounts", totalCurrentAccounts,
                "totalSavingAccounts",  totalSavingAccounts
        );
    }
}
