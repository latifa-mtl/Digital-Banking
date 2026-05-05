package ma.enset.ebankingbackend.exceptions;

/**
 * @author admin
 **/
public class BankAccountNotFoundException extends Exception {
    public BankAccountNotFoundException(String message) {
        super(message);
    }
}
