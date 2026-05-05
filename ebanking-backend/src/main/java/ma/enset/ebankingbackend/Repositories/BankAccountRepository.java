package ma.enset.ebankingbackend.repositories;

import ma.enset.ebankingbackend.entities.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author admin
 **/
public interface BankAccountRepository extends JpaRepository<BankAccount, String> {
}
