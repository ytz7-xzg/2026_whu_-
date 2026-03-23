package redlib.backend.model; // 保留你自己的包名

import lombok.Data;
import java.util.Date;

@Data
public class User {
    private Long id;
    private String username;
    private String password;
    private Date createTime;
    private Date updateTime;
}