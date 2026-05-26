package moutawakil.latifa.ebankingbackend.web;

import moutawakil.latifa.ebankingbackend.entities.AccountOperation;
import moutawakil.latifa.ebankingbackend.entities.BankAccount;
import moutawakil.latifa.ebankingbackend.entities.CurrentAccount;
import moutawakil.latifa.ebankingbackend.entities.SavingAccount;
import moutawakil.latifa.ebankingbackend.enums.OperationType;
import moutawakil.latifa.ebankingbackend.repositories.AccountOperationRepository;
import moutawakil.latifa.ebankingbackend.repositories.BankAccountRepository;
import moutawakil.latifa.ebankingbackend.repositories.CustomerRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final CustomerRepository customerRepository;
    private final BankAccountRepository accountRepository;
    private final AccountOperationRepository operationRepository;

    public DashboardController(CustomerRepository customerRepository,
                               BankAccountRepository accountRepository,
                               AccountOperationRepository operationRepository) {
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.operationRepository = operationRepository;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        List<BankAccount> accounts = accountRepository.findAll();
        List<AccountOperation> operations = operationRepository.findAll();

        double totalBalance = accounts.stream()
                .mapToDouble(BankAccount::getBalance)
                .sum();

        double totalCredits = operations.stream()
                .filter(o -> o.getType() == OperationType.CREDIT)
                .mapToDouble(AccountOperation::getAmount)
                .sum();

        double totalDebits = operations.stream()
                .filter(o -> o.getType() == OperationType.DEBIT)
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
