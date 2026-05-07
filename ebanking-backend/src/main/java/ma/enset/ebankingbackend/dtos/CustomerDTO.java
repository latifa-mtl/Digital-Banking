package ma.enset.ebankingbackend.dtos;

import lombok.Data;

/**
 * @author admin
 **/
@Data
public class CustomerDTO {
    private Long id;
    private String name;
    private String email;
}
