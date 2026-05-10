package ma.enset.ebankingbackend.dtos;

import lombok.Data;
import java.util.List;

@Data
public class DashboardDTO {

    private long   totalCustomers;
    private long   totalAccounts;
    private long   activeAccounts;
    private long   suspendedAccounts;
    private long   currentAccounts;
    private long   savingAccounts;
    private double totalBalance;
    private double totalDebitAmount;
    private double totalCreditAmount;
    private long   totalOperations;

    private List<CustomerDTO>          recentCustomers;   // last 5
    private List<RecentAccountDTO>     recentAccounts;    // last 5
    private List<RecentOperationDTO>   recentOperations;  // last 8

    @Data
    public static class RecentAccountDTO {
        private String id;
        private String type;          // "CurrentAccount" | "SavingAccount"
        private double balance;
        private String status;
        private String currency;
        private String customerName;
        private String createdAt;
        private double overdraft;     // CurrentAccount only
        private double interestRate;  // SavingAccount only
    }

    @Data
    public static class RecentOperationDTO {
        private Long   id;
        private String operationDate;
        private double amount;
        private String type;          // "DEBIT" | "CREDIT"
        private String description;
        private String accountId;
        private String customerName;
    }
}