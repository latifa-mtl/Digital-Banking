package ma.enset.ebankingbackend.services;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.ebankingbackend.entities.*;
import ma.enset.ebankingbackend.enums.OperationType;
import ma.enset.ebankingbackend.exceptions.BalanceNotSufficientException;
import ma.enset.ebankingbackend.exceptions.BankAccountNotFoundException;
import ma.enset.ebankingbackend.exceptions.CustomerNotFoundException;
import ma.enset.ebankingbackend.repositories.AccountOperationRepository;
import ma.enset.ebankingbackend.repositories.BankAccountRepository;
import ma.enset.ebankingbackend.repositories.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * @author admin
 **/
@Service
@Transactional
@AllArgsConstructor
@Slf4j
public class BankAccountServiceImpl implements BankAccountService {

    private final BankAccountRepository bankAccountRepository;
    private final CustomerRepository customerRepository;
    private final AccountOperationRepository  accountOperationRepository;

    //could be done by lombok with th annotation @AllArgConstructor
//    public BankAccountServiceImpl(BankAccountRepository bankAccountRepository,  CustomerRepository customerRepository, AccountOperationRepository accountOperationRepository) {
//        this.bankAccountRepository = bankAccountRepository;
//        this.customerRepository = customerRepository;
//        this.accountOperationRepository = accountOperationRepository;
//    }

    //it can be auto added using lombok with the annotation @SLF4J
    //Logger log = LoggerFactory.getLogger(this.getClass().getName());

    @Override
    public Customer saveCustomer(Customer customer) {
        log.info("Saving new customer");
        return customerRepository.save(customer);
    }

    @Override
    public CurrentAccount saveCurrentBankAccount(double initialBalance, double overDraft, Long customerId) throws CustomerNotFoundException{
        Customer customer=customerRepository.findById(customerId).orElse(null);
        if (customer == null) {
            throw new CustomerNotFoundException("Customer not found");
        }
        CurrentAccount currentAccount = new CurrentAccount();
        currentAccount.setId(UUID.randomUUID().toString());
        currentAccount.setBalance(initialBalance);
        currentAccount.setCreatedAt(new Date());
        currentAccount.setCustomer(customer);
        currentAccount.setOverdraft(overDraft);
        currentAccount.setCurrency("DH");
        return bankAccountRepository.save(currentAccount);
    }

    @Override
    public SavingAccount saveSavingBankAccount(double initialBalance, double interestRate, Long customerId) throws CustomerNotFoundException {
        Customer customer=customerRepository.findById(customerId).orElse(null);
        if (customer == null) {
            throw new CustomerNotFoundException("Customer not found");
        }
        SavingAccount savingAccount = new SavingAccount();
        savingAccount.setId(UUID.randomUUID().toString());
        savingAccount.setBalance(initialBalance);
        savingAccount.setCreatedAt(new Date());
        savingAccount.setCustomer(customer);
        savingAccount.setInterestRate(interestRate);
        savingAccount.setCurrency("DH");
        return bankAccountRepository.save(savingAccount);
    }

    @Override
    public List<Customer> listCustomers() {
        return customerRepository.findAll();
    }

    @Override
    public BankAccount getBankAccount(String accountId) throws BankAccountNotFoundException {
        BankAccount bankAccount = bankAccountRepository.findById(accountId).orElseThrow(()->new BankAccountNotFoundException("BankAccount not found"));
        return bankAccount;
    }

    @Override
    public void debit(String accountId, double amount, String description) throws BankAccountNotFoundException, BalanceNotSufficientException {
        BankAccount bankAccount=getBankAccount(accountId);
        if (bankAccount.getBalance() < amount) {
            throw new BalanceNotSufficientException("not enough");
        }
        AccountOperation accountOperation=new AccountOperation();
        accountOperation.setAmount(amount);
        accountOperation.setDescription(description);
        accountOperation.setOperationType(OperationType.DEBIT);
        accountOperation.setOperationDate(new Date());
        accountOperation.setBankAccount(bankAccount);
        accountOperationRepository.save(accountOperation);
        bankAccount.setBalance(bankAccount.getBalance() - amount);
        bankAccountRepository.save(bankAccount);


    }

    @Override
    public void credit(String accountId, double amount, String description) throws BankAccountNotFoundException{
        BankAccount bankAccount=getBankAccount(accountId);
        AccountOperation accountOperation=new AccountOperation();
        accountOperation.setAmount(amount);
        accountOperation.setDescription(description);
        accountOperation.setOperationType(OperationType.CREDIT);
        accountOperation.setOperationDate(new Date());
        accountOperation.setBankAccount(bankAccount);
        accountOperationRepository.save(accountOperation);
        bankAccount.setBalance(bankAccount.getBalance() + amount);
        bankAccountRepository.save(bankAccount);
    }

    @Override
    public void transfer(String fromAccountId, String toAccountId, double amount) throws BankAccountNotFoundException, BalanceNotSufficientException {
        debit(fromAccountId,amount,"Transfer to "+toAccountId);
        credit(toAccountId,amount,"Transfer from "+fromAccountId);

    }

    @Override
    public List<BankAccount> bankAccountList(){
        return bankAccountRepository.findAll();
    }
}
