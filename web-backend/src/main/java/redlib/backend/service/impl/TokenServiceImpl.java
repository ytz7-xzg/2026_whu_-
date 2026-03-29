package redlib.backend.service.impl;

import eu.bitwalker.useragentutils.Browser;
import eu.bitwalker.useragentutils.OperatingSystem;
import eu.bitwalker.useragentutils.UserAgent;
import eu.bitwalker.useragentutils.Version;
import org.springframework.stereotype.Service;
import redlib.backend.model.Token;
import redlib.backend.service.TokenService;

import java.util.Date;
import java.util.HashSet;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenServiceImpl implements TokenService {

    private final Map<String, Token> tokenMap = new ConcurrentHashMap<>(1 << 8);

    @Override
    public Token login(String userId, String password, String ipAddress, String userAgent) {
        Integer uid = Integer.valueOf(userId);

        Token token = new Token();
        token.setAccessToken(UUID.randomUUID().toString().replace("-", ""));
        token.setUserId(uid);
        token.setLastAction(new Date());
        token.setIpAddress(ipAddress);
        token.setPrivSet(new HashSet<>());

        try {
            UserAgent ua = UserAgent.parseUserAgentString(userAgent);
            Browser browser = ua.getBrowser();
            OperatingSystem os = ua.getOperatingSystem();
            Version version = ua.getBrowserVersion();

            if (browser != null) {
                token.setBrowser(browser.getName());
                if (version != null) {
                    token.setBrowser(token.getBrowser() + " V" + version.getVersion());
                }
            }

            if (os != null) {
                token.setOs(os.getName());
                if (os.getDeviceType() != null) {
                    token.setDevice(os.getDeviceType().getName());
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        tokenMap.put(token.getAccessToken(), token);
        return token;
    }

    @Override
    public Token getToken(String accessToken) {
        if (accessToken == null || accessToken.trim().isEmpty()) {
            return null;
        }
        return tokenMap.get(accessToken);
    }

    @Override
    public void logout(String accessToken) {
        tokenMap.remove(accessToken);
    }
}
