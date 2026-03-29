package redlib.backend.service;

import redlib.backend.model.Token;

public interface TokenService {

    Token login(String userId, String password, String ipAddress, String userAgent);

    Token getToken(String accessToken);

    void logout(String accessToken);
}
