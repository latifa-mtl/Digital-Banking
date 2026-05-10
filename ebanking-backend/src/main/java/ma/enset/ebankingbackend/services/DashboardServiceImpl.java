package ma.enset.ebankingbackend.services;

import lombok.AllArgsConstructor;
import ma.enset.ebankingbackend.dtos.CustomerDTO;
import ma.enset.ebankingbackend.dtos.DashboardDTO;
import ma.enset.ebankingbackend.entities.AccountOperation;
import ma.enset.ebankingbackend.entities.BankAccount;
import ma.enset.ebankingbackend.entities.CurrentAccount;
import ma.enset.ebankingbackend.entities.SavingAccount;
import ma.enset.ebankingbackend.enums.AccountStatus;
import ma.enset.ebankingbackend.enums.OperationType;
import ma.enset.ebankingbackend.repositories.AccountOperationRepository;
import ma.enset.ebankingbackend.repositories.BankAccountRepository;
import ma.enset.ebankingbackend.repositories.CustomerRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final CustomerRepository         customerRepository;
    private final BankAccountRepository      bankAccountRepository;
    private final AccountOperationRepository operationRepository;

    private static final SimpleDateFormat SDF =
            new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");

    @Override
    public DashboardDTO getDashboardData() {
        DashboardDTO dto = new DashboardDTO();

        // ── KPIs ─────────────────────────────────────────────────
        List<BankAccount> allAccounts = bankAccountRepository.findAll();

        dto.setTotalCustomers(customerRepository.count());
        dto.setTotalAccounts(allAccounts.size());
        dto.setActiveAccounts(
                allAccounts.stream()
                        .filter(a -> a.getAccountStatus() == AccountStatus.ACTIVATED).count());
        dto.setSuspendedAccounts(
                allAccounts.stream()
                        .filter(a -> a.getAccountStatus() == AccountStatus.SUSPENDED).count());
        dto.setCurrentAccounts(
                allAccounts.stream().filter(a -> a instanceof CurrentAccount).count());
        dto.setSavingAccounts(
                allAccounts.stream().filter(a -> a instanceof SavingAccount).count());
        dto.setTotalBalance(
                allAccounts.stream().mapToDouble(BankAccount::getBalance).sum());

        List<AccountOperation> allOps = operationRepository.findAll();
        dto.setTotalOperations(allOps.size());
        dto.setTotalDebitAmount(
                allOps.stream()
                        .filter(o -> o.getOperationType() == OperationType.DEBIT)
                        .mapToDouble(AccountOperation::getAmount).sum());
        dto.setTotalCreditAmount(
                allOps.stream()
                        .filter(o -> o.getOperationType() == OperationType.CREDIT)
                        .mapToDouble(AccountOperation::getAmount).sum());

        // ── Recent customers (last 5) ─────────────────────────────
        dto.setRecentCustomers(
                customerRepository
                        .findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "id")))
                        .stream().map(c -> {
                            CustomerDTO cdto = new CustomerDTO();
                            cdto.setId(c.getId());
                            cdto.setName(c.getName());
                            cdto.setEmail(c.getEmail());
                            return cdto;
                        }).collect(Collectors.toList()));

        // ── Recent accounts (last 5) ──────────────────────────────
        dto.setRecentAccounts(
                bankAccountRepository
                        .findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt")))
                        .stream().map(this::mapAccount).collect(Collectors.toList()));

        // ── Recent operations (last 8) ────────────────────────────
        dto.setRecentOperations(
                operationRepository
                        .findAll(PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "operationDate")))
                        .stream().map(this::mapOperation).collect(Collectors.toList()));

        return dto;
    }

    private DashboardDTO.RecentAccountDTO mapAccount(BankAccount a) {
        DashboardDTO.RecentAccountDTO d = new DashboardDTO.RecentAccountDTO();
        d.setId(a.getId());
        d.setBalance(a.getBalance());
        d.setStatus(a.getAccountStatus() != null ? a.getAccountStatus().name() : "");
        d.setCurrency(a.getCurrency());
        d.setCreatedAt(a.getCreatedAt() != null ? SDF.format(a.getCreatedAt()) : "");
        if (a.getCustomer() != null) d.setCustomerName(a.getCustomer().getName());
        if (a instanceof CurrentAccount ca) { d.setType("CurrentAccount"); d.setOverdraft(ca.getOverdraft()); }
        else if (a instanceof SavingAccount sa) { d.setType("SavingAccount"); d.setInterestRate(sa.getInterestRate()); }
        return d;
    }

    private DashboardDTO.RecentOperationDTO mapOperation(AccountOperation op) {
        DashboardDTO.RecentOperationDTO d = new DashboardDTO.RecentOperationDTO();
        d.setId(op.getId());
        d.setAmount(op.getAmount());
        d.setDescription(op.getDescription());
        d.setType(op.getOperationType() != null ? op.getOperationType().name() : "");
        d.setOperationDate(op.getOperationDate() != null ? SDF.format(op.getOperationDate()) : "");
        if (op.getBankAccount() != null) {
            d.setAccountId(op.getBankAccount().getId());
            if (op.getBankAccount().getCustomer() != null)
                d.setCustomerName(op.getBankAccount().getCustomer().getName());
        }
        return d;
    }
}