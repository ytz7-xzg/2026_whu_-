package redlib.backend.controller; //

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor; // ✨ 引入 Lombok 注解
import org.springframework.web.bind.annotation.*;
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
@Tag(name = "认证与注册接口")
@RequiredArgsConstructor // ✨ 加上这个核心注解
public class AuthenticationController {

    // ✨ 彻底抛弃 @Autowired，改用企业级规范的 private final
    private final TokenService tokenService;
    private final UserService userService;

    // 💡 统一返回格式
    private <T> ResponseData<T> success(T data) {
        ResponseData<T> response = new ResponseData<>();
        response.setCode(200);
        response.setSuccess(true);
        response.setData(data);
        return response;
    }

    // ✨ 1. 注册接口
    @PostMapping("/register")
    @NeedNoPrivilege
    @Operation(summary = "用户注册")
    public ResponseData<String> register(@RequestBody User user) {
        userService.register(user);
        return success("注册成功，快去登录吧！");
    }

    // ✨ 2. 登录接口
    @PostMapping("/login")
    @NeedNoPrivilege
    @Operation(summary = "用户登录")
    public ResponseData<Token> login(@RequestBody User loginUser, HttpServletRequest request, HttpServletResponse response) {
        // 第一步：去 user 表核对账号密码
        User realUser = userService.login(loginUser.getUsername(), loginUser.getPassword());

        // 第二步：发放 Token
        String ipAddress = request.getRemoteAddr();
        ipAddress = ipAddress.replace("[", "").replace("]", "");
        Token token = tokenService.login(String.valueOf(realUser.getId()), loginUser.getPassword(), ipAddress, request.getHeader("user-agent"));

        // 第三步：写 Cookie
        Cookie cookie = new Cookie("accessToken", token.getAccessToken());
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        response.addCookie(cookie);

        return success(token);
    }

    // ... (下面的 getCurrentUser, logout 保持不变)
    @GetMapping("/getCurrentUser")
    @Privilege
    @Operation(summary = "获取当前登录用户信息")
    public ResponseData<Token> getCurrentUser() {
        return success(ThreadContextHolder.getToken());
    }

    @GetMapping("/logout")
    @Privilege
    @Operation(summary = "退出登录")
    public ResponseData<String> logout() {
        Token token = null;
        try {
            token = ThreadContextHolder.getToken();
        } catch (Exception ignore) {
        }
        if (token != null) {
            tokenService.logout(token.getAccessToken());
        }
        return success("退出成功");
    }
}