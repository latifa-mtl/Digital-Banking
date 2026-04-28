package ma.enset.ebankingbackend.Repositories;

import ma.enset.ebankingbackend.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author admin
 **/
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
}
