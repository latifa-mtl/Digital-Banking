package ma.enset.ebankingbackend;

import ma.enset.ebankingbackend.exceptions.BalanceNotSufficientException;
import ma.enset.ebankingbackend.exceptions.BankAccountNotFoundException;
import ma.enset.ebankingbackend.exceptions.CustomerNotFoundException;
import ma.enset.ebankingbackend.repositories.AccountOperationRepository;
import ma.enset.ebankingbackend.repositories.BankAccountRepository;
import ma.enset.ebankingbackend.repositories.CustomerRepository;
import ma.enset.ebankingbackend.entities.*;
import ma.enset.ebankingbackend.enums.AccountStatus;
import ma.enset.ebankingbackend.enums.OperationType;
import ma.enset.ebankingbackend.services.BankAccountService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.Date;
import java.util.UUID;
import java.util.stream.Stream;

@SpringBootApplication
public class EbankingBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(EbankingBackendApplication.class, args);
    }

    @Bean
    CommandLineRunner commandLineRunner(BankAccountService  bankAccountService) {
        return args -> {
            Stream.of("Lateefa","Halima","Chaimae").forEach(name -> {
               Customer customer = new Customer();
               customer.setName(name);
               customer.setEmail(name+"@gmail.com");
               bankAccountService.saveCustomer(customer);
            });
            bankAccountService.listCustomers().forEach(customer -> {
                try {
                    bankAccountService.saveCurrentBankAccount(Math.random()*90000,9000,customer.getId());
                    bankAccountService.saveSavingBankAccount(Math.random()*120000,5.5,customer.getId());
                    bankAccountService.bankAccountList().forEach(bankAccount -> {
                        for (int i = 0; i < 10; i++) {
                            try {
                                bankAccountService.credit(bankAccount.getId(),1000+Math.random()*120000,"Credit");
                                bankAccountService.debit(bankAccount.getId(),1000+Math.random()*9000,"Debit");
                            } catch (BankAccountNotFoundException e) {
                                throw new RuntimeException(e);
                            } catch (BalanceNotSufficientException e) {
                                throw new RuntimeException(e);
                            }


                        }
                    });
                } catch (CustomerNotFoundException e) {
                    e.printStackTrace();
                }
            });
//            List<BankAccountDTO> bankAccounts = bankAccountService.bankAccountList();
//            for (BankAccountDTO bankAccount:bankAccounts){
//                for (int i = 0; i <10 ; i++) {
//                    String accountId;
//                    if(bankAccount instanceof SavingBankAccountDTO){
//                        accountId=((SavingBankAccountDTO) bankAccount).getId();
//                    } else{
//                        accountId=((CurrentBankAccountDTO) bankAccount).getId();
//                    }
//                    bankAccountService.credit(accountId,10000+Math.random()*120000,"Credit");
//                    bankAccountService.debit(accountId,1000+Math.random()*9000,"Debit");
//                }
//            }
        };
    }


    //@Bean
    CommandLineRunner start(CustomerRepository customerRepository,
                            BankAccountRepository bankAccounyRepository,
                            AccountOperationRepository accountOperationRepository) {
        return args -> {
            Stream.of("Lateefa","Amine","Chaimaa").forEach(name -> {
                Customer customer = new Customer();
                customer.setName(name);
                customer.setEmail(name+"@gmail.com");
                customerRepository.save(customer);
            });
            customerRepository.findAll().forEach(customer -> {
                CurrentAccount currentAccount = new CurrentAccount();
                currentAccount.setId(UUID.randomUUID().toString());
                currentAccount.setCustomer(customer);
                currentAccount.setBalance(Math.random()*10000);
                currentAccount.setCreatedAt(new Date());
                currentAccount.setAccountStatus(AccountStatus.CREATED);
                currentAccount.setOverdraft(9000);
                bankAccounyRepository.save(currentAccount);
            });

            customerRepository.findAll().forEach(customer -> {
                SavingAccount savingAccount= new SavingAccount();
                savingAccount.setId(UUID.randomUUID().toString());
                savingAccount.setCustomer(customer);
                savingAccount.setBalance(Math.random()*10000);
                savingAccount.setCreatedAt(new Date());
                savingAccount.setAccountStatus(AccountStatus.CREATED);
                savingAccount.setInterestRate(5);
                bankAccounyRepository.save(savingAccount);
            });

            bankAccounyRepository.findAll().forEach(bankAccount -> {
                for (int i = 0; i < 10; i++) {
                    AccountOperation accountOperation = new AccountOperation();
                    accountOperation.setOperationDate(new Date());
                    accountOperation.setAmount(Math.random()*10000);
                    accountOperation.setBankAccount(bankAccount);
                    accountOperation.setOperationType(Math.random()>0.5? OperationType.DEBIT:OperationType.CREDIT);
                    accountOperationRepository.save(accountOperation);

                }
            });

        };
    }
}
