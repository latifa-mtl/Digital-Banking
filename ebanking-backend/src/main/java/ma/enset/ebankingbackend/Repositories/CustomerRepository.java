package ma.enset.ebankingbackend.repositories;

import ma.enset.ebankingbackend.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author admin
 **/
public interface CustomerRepository extends JpaRepository<Customer, Long> {
}
