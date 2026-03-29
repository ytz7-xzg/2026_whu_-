package redlib.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;
import redlib.backend.annotation.BackendModule;
import redlib.backend.annotation.NeedNoPrivilege;
import redlib.backend.annotation.Privilege;
import redlib.backend.model.Token;
import redlib.backend.utils.ThreadContextHolder;

import java.lang.reflect.Method;

@Component
@Aspect
@Slf4j
public class TokenCheckAspect {

    @Before("execution(* redlib.backend.controller..*Controller.*(..))")
    public void processLog(JoinPoint joinPoint) throws Exception {
        Class<?> clazz = joinPoint.getTarget().getClass();
        String methodName = joinPoint.getSignature().getName();
        Class<?>[] parameterTypes =
                ((MethodSignature) joinPoint.getSignature()).getMethod().getParameterTypes();

        Method method = clazz.getMethod(methodName, parameterTypes);
        if (method.getAnnotation(NeedNoPrivilege.class) != null) {
            return;
        }

        if ("login".equals(methodName)) {
            return;
        }

        Privilege privilege = method.getAnnotation(Privilege.class);
        if (privilege != null && privilege.value().length == 0) {
            ThreadContextHolder.getToken();
            return;
        }

        Token token = ThreadContextHolder.getToken();
        Assert.notNull(token, "未登录，请重新登录");
        if ("ping".equals(methodName)) {
            return;
        }

        if ("root".equalsIgnoreCase(token.getUserCode())) {
            return;
        }

        BackendModule moduleAnnotation = clazz.getAnnotation(BackendModule.class);
        Assert.notNull(moduleAnnotation, "访问的类没有 BackendModule 注解");

        String moduleName = getModuleName(moduleAnnotation);
        Assert.notNull(privilege, "方法没有 Privilege 注解，不能访问: " + moduleName + '.' + methodName);
        for (String value : privilege.value()) {
            if (token.getPrivSet().contains(moduleName + '.' + value)) {
                return;
            }
        }

        throw new RuntimeException("您没有权限执行此操作");
    }

    private String getModuleName(BackendModule moduleAnnotation) {
        String[] values = moduleAnnotation.value();
        Assert.isTrue(values.length > 0, "BackendModule 未配置模块信息");

        String module = values[0];
        int separatorIndex = module.indexOf(':');
        return separatorIndex >= 0 ? module.substring(0, separatorIndex) : module;
    }
}
