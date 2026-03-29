package redlib.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import redlib.backend.annotation.BackendModule;
import redlib.backend.annotation.Privilege;
import redlib.backend.dto.query.LoginLogQueryDTO;
import redlib.backend.model.Page;
import redlib.backend.service.LoginLogService;
import redlib.backend.vo.LoginLogVO;

/**
 * 登录日志 Controller
 *
 * 职责：处理登录日志查询请求。
 *
 * @author lihongwen
 * @date 2020/4/1
 */
@RestController
@RequestMapping("/api/loginLog")
@BackendModule({"page:页面"})
public class LoginLogController {
    // 注入登录日志服务，负责日志查询。
    @Autowired
    private LoginLogService logService;

    /**
     * 查询登录日志列表。
     *
     * @param queryDTO 查询参数
     * @return 分页后的登录日志结果
     */
    @PostMapping("list")
    @Privilege("page")
    public Page<LoginLogVO> listLoginLog(@RequestBody LoginLogQueryDTO queryDTO) {
        // 调用服务层查询登录日志。
        return logService.list(queryDTO);
    }
}
