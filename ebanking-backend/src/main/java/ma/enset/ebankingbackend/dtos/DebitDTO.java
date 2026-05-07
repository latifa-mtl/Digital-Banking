package ma.enset.ebankingbackend.dtos;

import lombok.Data;

/**
 * @author admin
 **/
@Data
public class DebitDTO {
    private String accountId;
    private double amount;
    private String description;
}
