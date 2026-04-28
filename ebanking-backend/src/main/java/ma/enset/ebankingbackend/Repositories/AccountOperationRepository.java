package ma.enset.ebankingbackend.Repositories;

import ma.enset.ebankingbackend.entities.AccountOperation;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author admin
 **/
public interface AccountOperationRepository extends JpaRepository<AccountOperation, Long> {
}
