package ma.enset.ebankingbackend;

import ma.enset.ebankingbackend.Repositories.AccountOperationRepository;
import ma.enset.ebankingbackend.Repositories.BankAccountRepository;
import ma.enset.ebankingbackend.Repositories.CustomerRepository;
import ma.enset.ebankingbackend.entities.*;
import ma.enset.ebankingbackend.enums.AccountStatus;
import ma.enset.ebankingbackend.enums.OperationType;
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
    CommandLineRunner commandLineRunner(BankAccountRepository bankAccountRepository) {
        return args -> {
            BankAccount bankAccount =
                    bankAccountRepository.findById("04dcc7a1-a6f2-4872-977f-5034fd60f0d8").orElse(null);
            if (bankAccount != null) {
                System.out.println("********** ");
                System.out.println(bankAccount.getId());
                System.out.println(bankAccount.getBalance());
                System.out.println(bankAccount.getAccountStatus());
                System.out.println(bankAccount.getCreatedAt());
                System.out.println(bankAccount.getCustomer().getName());
                System.out.println(bankAccount.getClass().getSimpleName());
                if (bankAccount instanceof CurrentAccount) {
                    System.out.println("Over Draft=>" + ((CurrentAccount) bankAccount).getOverdraft());
                } else if (bankAccount instanceof SavingAccount) {
                    System.out.println("Rate=>" + ((SavingAccount) bankAccount).getInterestRate());
                }

                bankAccount.getAccountOperations().forEach(op -> {
                        System.out.println(op.getOperationType() + "\t" + op.getOperationDate() + "\t" + op.getAmount());

                });
            }
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
