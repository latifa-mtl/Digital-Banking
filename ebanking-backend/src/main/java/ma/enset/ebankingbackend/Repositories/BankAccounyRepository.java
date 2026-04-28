package ma.enset.ebankingbackend.Repositories;

import ma.enset.ebankingbackend.entities.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author admin
 **/
public interface BankAccounyRepository extends JpaRepository<BankAccount, String> {
}
