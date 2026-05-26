package moutawakil.latifa.ebankingbackend.repositories;


import moutawakil.latifa.ebankingbackend.entities.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BankAccountRepository extends JpaRepository<BankAccount,String> {
    @Query("SELECT SUM(a.balance) FROM BankAccount a")
    Double sumAllBalances();

    @Query("SELECT COUNT(a) FROM CurrentAccount a")
    long countCurrentAccounts();

    @Query("SELECT COUNT(a) FROM SavingAccount a")
    long countSavingAccounts();
}
