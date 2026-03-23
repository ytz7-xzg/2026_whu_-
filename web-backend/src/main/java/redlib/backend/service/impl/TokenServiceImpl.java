package redlib.backend.service.impl;

import eu.bitwalker.useragentutils.Browser;
import eu.bitwalker.useragentutils.OperatingSystem;
import eu.bitwalker.useragentutils.UserAgent;
import eu.bitwalker.useragentutils.Version;
import org.springframework.stereotype.Service;
import redlib.backend.model.Token;
import redlib.backend.service.TokenService;
import redlib.backend.vo.OnlineUserVO;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 登录态管理实现类。
 *
 * 主要负责：
 * 1. 登录成功后生成 token
 * 2. 根据 token 获取当前登录用户
 * 3. 退出登录
 * 4. 强制下线
 *
 * 注意：
 * - 当前项目把 token 存在内存中，而不是 Redis 或数据库
 * - 所以后端服务一重启，所有登录态都会丢失
 */
@Service
public class TokenServiceImpl implements TokenService {

    /**
     * 内存中的 token 表。
     *
     * key   = accessToken
     * value = Token 对象
     */
    private Map<String, Token> tokenMap = new ConcurrentHashMap<>(1 << 8);

    /**
     * 登录成功后创建 token。
     *
     * 逻辑：
     * 1. 根据用户 ID 创建 Token 对象
     * 2. 生成随机 accessToken
     * 3. 记录用户 ID、IP、最后活跃时间
     * 4. 解析浏览器和操作系统信息
     * 5. 把 token 放入内存 tokenMap
     * 6. 返回 token
     *
     * @param userId    当前登录用户的 ID（字符串形式）
     * @param password  当前实现里这个参数没有真正参与业务逻辑，属于冗余参数
     * @param ipAddress 当前请求 IP
     * @param userAgent 浏览器 User-Agent
     * @return 新生成的 Token 对象
     */
    @Override
    public Token login(String userId, String password, String ipAddress, String userAgent) {
        // 把字符串形式的 userId 转成整数，后续存进 Token
        Integer uid = Integer.valueOf(userId);

        // 创建新的 token 对象
        Token token = new Token();

        // 生成随机 accessToken，作为当前登录态的唯一凭证
        token.setAccessToken(UUID.randomUUID().toString().replaceAll("-", ""));

        // 绑定当前登录用户 ID
        token.setUserId(uid);

        // 记录最后活跃时间
        token.setLastAction(new Date());

        // 记录用户 IP
        token.setIpAddress(ipAddress);

        // 普通用户当前不使用后台复杂权限体系，所以这里给一个空权限集合
        token.setPrivSet(new HashSet<>());

        // 尝试解析浏览器和操作系统信息，方便记录登录环境
        try {
            UserAgent ua = UserAgent.parseUserAgentString(userAgent);
            Browser browser = ua.getBrowser();
            OperatingSystem os = ua.getOperatingSystem();
            Version version = ua.getBrowserVersion();

            // 记录浏览器名称和版本
            if (browser != null) {
                token.setBrowser(browser.getName());
                if (version != null) {
                    token.setBrowser(token.getBrowser() + " V" + version.getVersion());
                }
            }

            // 记录操作系统和设备类型
            if (os != null) {
                token.setOs(os.getName());
                if (os.getDeviceType() != null) {
                    token.setDevice(os.getDeviceType().getName());
                }
            }
        } catch (Exception ex) {
            // 这里解析失败不影响主流程，只打印异常
            ex.printStackTrace();
        }

        // 把 token 放进内存，表示“当前用户已经登录”
        tokenMap.put(token.getAccessToken(), token);

        // 返回给上层，Controller 会把 accessToken 写入 Cookie
        return token;
    }

    /**
     * 根据 accessToken 获取当前登录态。
     *
     * 逻辑：
     * 1. token 为空则直接返回 null
     * 2. token 不为空则从内存 tokenMap 中查找
     *
     * @param accessToken 前端 Cookie 带来的 accessToken
     * @return 对应的 Token；如果不存在则返回 null
     */
    @Override
    public Token getToken(String accessToken) {
        if (accessToken == null || accessToken.trim().isEmpty()) {
            return null;
        }
        return tokenMap.get(accessToken);
    }

    /**
     * 退出登录。
     *
     * 本质上就是从 tokenMap 中删除当前 accessToken。
     *
     * @param accessToken 当前用户 token
     */
    @Override
    public void logout(String accessToken) {
        tokenMap.remove(accessToken);
    }

    /**
     * 获取在线用户列表。
     *
     * 当前实现：
     * - 直接返回空列表
     *
     * 说明：
     * - 这个功能在当前项目里没有真正做完整
     * - 理论上应该把 tokenMap 转成 OnlineUserVO 列表返回
     *
     * @return 空列表
     */
    @Override
    public List<OnlineUserVO> list() {
        return new ArrayList<>();
    }

    /**
     * 强制指定 token 下线。
     *
     * 本质和 logout 很像：
     * - 都是把 token 从内存中删除
     *
     * @param accessToken 要被踢下线的 token
     */
    @Override
    public void kick(String accessToken) {
        tokenMap.remove(accessToken);
    }
}
