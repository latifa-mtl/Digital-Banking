package ma.enset.ebankingbackend.exceptions;

/**
 * @author admin
 **/
public class BalanceNotSufficientException extends Exception {
    public BalanceNotSufficientException(String message) {
        super(message);
    }
}
