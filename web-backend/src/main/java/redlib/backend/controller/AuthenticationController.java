package redlib.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class AuthenticationController {

    // 注入令牌服务，负责登录态的签发、校验和注销。
    private final TokenService tokenService;
    // 注入用户服务，负责注册和账号密码校验。
    private final UserService userService;

    private <T> ResponseData<T> success(T data) {
        ResponseData<T> response = new ResponseData<>(); // 创建统一响应对象。
        response.setCode(200); // 设置成功状态码。
        response.setSuccess(true); // 标记本次请求处理成功。
        response.setData(data); // 把业务结果放入响应体中。
        return response; // 返回统一格式的响应结果。
    }

    @PostMapping("/register")
    @NeedNoPrivilege
    @Operation(summary = "用户注册")
    public ResponseData<String> register(@RequestBody User user) {
        userService.register(user); // 调用用户业务层完成注册，包括参数校验和数据入库。
        return success("注册成功，快去登录吧！"); // 返回注册成功提示。
    }

    @PostMapping("/login")
    @NeedNoPrivilege
    @Operation(summary = "用户登录")
    public ResponseData<Token> login(@RequestBody User loginUser, HttpServletRequest request, HttpServletResponse response) {
        User realUser = userService.login(loginUser.getUsername(), loginUser.getPassword()); // 先校验用户名和密码，拿到数据库中的真实用户信息。

        String ipAddress = request.getRemoteAddr(); // 获取本次登录请求的来源 IP。
        ipAddress = ipAddress.replace("[", "").replace("]", ""); // 兼容部分环境下 IPv6 地址外层中括号格式。
        Token token = tokenService.login(
                String.valueOf(realUser.getId()), // 使用真实用户 ID 生成登录态。
                loginUser.getPassword(), // 传入本次登录密码，供令牌服务做必要处理。
                ipAddress, // 记录本次登录 IP，便于安全审计。
                request.getHeader("user-agent") // 记录客户端设备信息。
        );

        Cookie cookie = new Cookie("accessToken", token.getAccessToken()); // 把 accessToken 写入 Cookie，方便浏览器后续自动携带。
        cookie.setPath("/"); // 设置 Cookie 生效路径为全站。
        cookie.setHttpOnly(true); // 禁止前端 JS 直接读取，降低被脚本窃取的风险。
        response.addCookie(cookie); // 把 Cookie 添加到响应头返回给浏览器。

        return success(token); // 把登录成功后的 Token 信息返回给前端。
    }

    @GetMapping("/getCurrentUser")
    @Privilege
    @Operation(summary = "获取当前登录用户信息")
    public ResponseData<Token> getCurrentUser() {
        return success(ThreadContextHolder.getToken()); // 从线程上下文中直接取出当前登录用户对应的 Token 信息并返回。
    }

    @GetMapping("/logout")
    @Privilege
    @Operation(summary = "退出登录")
    public ResponseData<String> logout() {
        Token token = null; // 先定义 token 变量，兼容未取到登录态的情况。
        try {
            token = ThreadContextHolder.getToken(); // 尝试从当前线程上下文中获取登录 Token。
        } catch (Exception ignore) {
            // 如果当前没有可用登录态，忽略异常，继续走统一退出响应。
        }
        if (token != null) {
            tokenService.logout(token.getAccessToken()); // 如果存在有效 Token，就调用业务层注销当前登录态。
        }
        return success("退出成功"); // 返回退出成功提示。
    }
}
