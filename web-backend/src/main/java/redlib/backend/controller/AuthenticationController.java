package redlib.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import redlib.backend.annotation.BackendModule;
import redlib.backend.annotation.NeedNoPrivilege;
import redlib.backend.annotation.Privilege;
import redlib.backend.model.ResponseData;
import redlib.backend.model.Token;
import redlib.backend.model.User;
import redlib.backend.service.TokenService;
import redlib.backend.service.UserService;
import redlib.backend.utils.ThreadContextHolder;

@RestController
@RequestMapping("/api/authentication")
@BackendModule({"page:页面"})
@Tag(name = "认证接口")
public class AuthenticationController {

    // 注入令牌服务，负责登录态的创建和退出。
    @Autowired
    private TokenService tokenService;

    // 注入用户服务，负责注册和账号校验。
    @Autowired
    private UserService userService;

    /**
     * 构造统一成功响应。
     *
     * @param data 业务数据
     * @return 标准响应体
     */
    private <T> ResponseData<T> success(T data) {
        // 创建统一响应对象。
        ResponseData<T> response = new ResponseData<>();
        // 设置成功状态码。
        response.setCode(200);
        // 标记本次请求处理成功。
        response.setSuccess(true);
        // 写入返回数据。
        response.setData(data);
        // 返回封装后的响应体。
        return response;
    }

    /**
     * 用户注册接口。
     *
     * @param user 前端提交的用户信息
     * @return 注册结果
     */
    @PostMapping("/register")
    @NeedNoPrivilege
    @Operation(summary = "用户注册")
    public ResponseData<String> register(@RequestBody User user) {
        // 调用用户服务完成注册。
        userService.register(user);
        // 返回注册成功提示。
        return success("注册成功");
    }

    /**
     * 用户登录接口。
     *
     * @param loginUser 前端提交的登录信息
     * @param request 请求对象
     * @param response 响应对象
     * @return 登录后的令牌信息
     */
    @PostMapping("/login")
    @NeedNoPrivilege
    @Operation(summary = "用户登录")
    public ResponseData<Token> login(
            @RequestBody User loginUser,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        // 校验用户名和密码，获取真实用户信息。
        User realUser = userService.login(loginUser.getUsername(), loginUser.getPassword());
        // 获取当前请求的来源 IP。
        String ipAddress = request.getRemoteAddr();
        // 去掉 IPv6 地址可能带上的中括号。
        ipAddress = ipAddress.replace("[", "").replace("]", "");
        // 创建新的登录令牌并记录登录环境信息。
        Token token = tokenService.login(
                String.valueOf(realUser.getId()),
                loginUser.getPassword(),
                ipAddress,
                request.getHeader("user-agent")
        );

        // 将 accessToken 写入 Cookie，便于浏览器后续自动携带。
        Cookie cookie = new Cookie("accessToken", token.getAccessToken());
        // 让 Cookie 对整个站点生效。
        cookie.setPath("/");
        // 禁止前端脚本直接读取 Cookie。
        cookie.setHttpOnly(true);
        // 将 Cookie 添加到响应头。
        response.addCookie(cookie);
        // 返回登录成功后的令牌信息。
        return success(token);
    }

    /**
     * 获取当前登录用户信息。
     *
     * @return 当前线程上下文中的令牌信息
     */
    @GetMapping("/getCurrentUser")
    @Privilege
    @Operation(summary = "获取当前用户")
    public ResponseData<Token> getCurrentUser() {
        // 直接从线程上下文中取出当前用户的令牌信息。
        return success(ThreadContextHolder.getToken());
    }

    /**
     * 退出登录接口。
     *
     * @return 退出结果
     */
    @GetMapping("/logout")
    @Privilege
    @Operation(summary = "退出登录")
    public ResponseData<String> logout() {
        // 先声明 token，兼容未登录或上下文缺失的情况。
        Token token = null;
        try {
            // 尝试获取当前登录令牌。
            token = ThreadContextHolder.getToken();
        } catch (Exception ignore) {
            // 没有取到令牌时忽略异常，仍然返回统一结果。
        }
        if (token != null) {
            // 如果存在有效令牌，则执行退出登录。
            tokenService.logout(token.getAccessToken());
        }
        // 返回退出成功提示。
        return success("退出成功");
    }
}
