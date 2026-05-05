package ma.enset.ebankingbackend.exceptions;

/**
 * @author admin
 **/
public class CustomerNotFoundException extends Exception { // used Exception to make it a checked exception
    // "CustomerNotFoundException extends RuntimeException" to make it an Unchecked exception
    public CustomerNotFoundException(String message) {
        super(message);
    }
}
