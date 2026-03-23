package redlib.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 允许所有接口被跨域访问
                // ⚠️ 注意这里：填入你前端真实运行的地址！
                // 如果你的前端是 Vite 默认就是 http://localhost:5173
                // 如果是 Vue CLI 默认就是 http://localhost:8080
                .allowedOrigins("http://localhost:5173", "http://localhost:8080")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 允许的请求方式
                .allowedHeaders("*") // 允许所有的请求头
                .allowCredentials(true) // ✨✨✨ 终极核心：允许前端携带 Cookie！
                .maxAge(3600); // 预检请求的缓存时间
    }
}