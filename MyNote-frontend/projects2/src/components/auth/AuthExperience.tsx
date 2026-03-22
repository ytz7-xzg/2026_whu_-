import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getDisplayName, login, register } from "../../utils/api";
import { getErrorMessage } from "../../utils/request";

type AuthMode = "login" | "register";
type GazeMode = "mouse" | "account" | "passwordHidden" | "passwordVisible";

type CharacterStageProps = {
  gazeMode: GazeMode;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  trackedField: HTMLInputElement | null;
  accountBias: number;
  surpriseSignal: number;
};

type AuthExperienceProps = {
  onBack?: () => void;
  onLoginSuccess?: (account: string) => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const LOOK_AWAY_OFFSET: Record<string, { x: number; y: number }> = {
  a: { x: -10, y: -5 },
  b: { x: -12, y: -6 },
  c: { x: 10, y: -6 },
  d: { x: 12, y: -5 },
};

function CharacterStage({
  gazeMode,
  pointerRef,
  trackedField,
  accountBias,
  surpriseSignal,
}: CharacterStageProps) {
  const eyeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pupilRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const pupilOffsetRef = useRef<Record<string, { x: number; y: number }>>({});
  const rafRef = useRef<number | null>(null);
  const [isBursting, setIsBursting] = useState(false);

  useEffect(() => {
    if (surpriseSignal === 0) return;
    setIsBursting(true);
    const timerId = window.setTimeout(() => setIsBursting(false), 440);
    return () => window.clearTimeout(timerId);
  }, [surpriseSignal]);

  const setEyeRef = (key: string) => (node: HTMLDivElement | null) => {
    eyeRefs.current[key] = node;
  };

  const setPupilRef = (key: string) => (node: HTMLSpanElement | null) => {
    pupilRefs.current[key] = node;
  };

  useEffect(() => {
    const getTargetPoint = () => {
      if (gazeMode === "mouse") return pointerRef.current;

      if (trackedField) {
        const fieldRect = trackedField.getBoundingClientRect();
        const biasX = gazeMode === "account" ? accountBias : 0;
        return {
          x: fieldRect.left + fieldRect.width * 0.34 + biasX,
          y: fieldRect.top + fieldRect.height * 0.52,
        };
      }

      return pointerRef.current;
    };

    const updatePupils = () => {
      const target = getTargetPoint();
      const smoothFactor = gazeMode === "passwordVisible" ? 0.34 : 0.2;
      const travelFactor = gazeMode === "passwordVisible" ? 0.24 : 0.18;

      for (const [key, eyeNode] of Object.entries(eyeRefs.current)) {
        const pupilNode = pupilRefs.current[key];
        if (!eyeNode || !pupilNode) continue;

        const rect = eyeNode.getBoundingClientRect();
        const limit = Math.min(rect.width, rect.height) * 0.28;

        let desiredX = 0;
        let desiredY = 0;

        if (gazeMode === "passwordHidden") {
          const roleId = key.split("-")[0];
          const lookAway = LOOK_AWAY_OFFSET[roleId] ?? { x: 0, y: 0 };
          desiredX = clamp(lookAway.x, -limit, limit);
          desiredY = clamp(lookAway.y, -limit, limit);
        } else {
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const deltaX = target.x - centerX;
          const deltaY = target.y - centerY;
          const distance = Math.hypot(deltaX, deltaY) || 1;
          const length = Math.min(limit, distance * travelFactor);

          desiredX = (deltaX / distance) * length;
          desiredY = (deltaY / distance) * length;
        }

        const previous = pupilOffsetRef.current[key] ?? { x: 0, y: 0 };
        const nextX = previous.x + (desiredX - previous.x) * smoothFactor;
        const nextY = previous.y + (desiredY - previous.y) * smoothFactor;

        pupilOffsetRef.current[key] = { x: nextX, y: nextY };
        pupilNode.style.transform = `translate(${nextX.toFixed(2)}px, ${nextY.toFixed(2)}px)`;
      }

      rafRef.current = window.requestAnimationFrame(updatePupils);
    };

    rafRef.current = window.requestAnimationFrame(updatePupils);
    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [gazeMode, trackedField, accountBias, pointerRef]);

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/48 p-5 shadow-[0_28px_80px_rgba(124,58,237,0.14)] backdrop-blur-2xl">
      <div className="absolute -top-20 left-[-9%] h-52 w-52 rounded-full bg-indigo-300/30 blur-[70px]" />
      <div className="absolute -bottom-16 right-[-6%] h-56 w-56 rounded-full bg-pink-300/30 blur-[75px]" />

      <div className="relative z-10 mb-5">
        <p className="mb-2 text-[11px] tracking-[0.2em] text-slate-500 uppercase">Creative Companion</p>
        <h3 className="text-2xl font-semibold text-slate-900 sm:text-[1.75rem]">灵感小队已就位</h3>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-slate-600">
          输入账号时它们会跟随你的节奏，输入密码时会礼貌回避，体验轻松但不过分打扰。
        </p>
      </div>

      <div
        className={`auth-character-stage ${
          gazeMode === "passwordHidden" ? "is-private" : ""
        } ${gazeMode === "passwordVisible" ? "is-surprised" : ""} ${isBursting ? "has-burst" : ""}`}
      >
        <div className="auth-character auth-character-b">
          <div className="auth-face auth-face-b">
            <div className="auth-eyes">
              <div ref={setEyeRef("b-left")} className="auth-eye">
                <span ref={setPupilRef("b-left")} className="auth-pupil" />
              </div>
              <div ref={setEyeRef("b-right")} className="auth-eye">
                <span ref={setPupilRef("b-right")} className="auth-pupil" />
              </div>
            </div>
            <div className="auth-mouth auth-mouth-smile" />
          </div>
        </div>

        <div className="auth-character auth-character-c">
          <div className="auth-face auth-face-c">
            <div className="auth-eyes">
              <div ref={setEyeRef("c-left")} className="auth-eye">
                <span ref={setPupilRef("c-left")} className="auth-pupil" />
              </div>
              <div ref={setEyeRef("c-right")} className="auth-eye">
                <span ref={setPupilRef("c-right")} className="auth-pupil" />
              </div>
            </div>
          </div>
        </div>

        <div className="auth-character auth-character-d">
          <div className="auth-face auth-face-d">
            <div className="auth-eyes">
              <div ref={setEyeRef("d-left")} className="auth-eye">
                <span ref={setPupilRef("d-left")} className="auth-pupil" />
              </div>
              <div ref={setEyeRef("d-right")} className="auth-eye">
                <span ref={setPupilRef("d-right")} className="auth-pupil" />
              </div>
            </div>
            <div className="auth-mouth auth-mouth-smile" />
          </div>
        </div>

        <div className="auth-character auth-character-a">
          <div className="auth-face auth-face-a">
            <div className="auth-eyes">
              <div ref={setEyeRef("a-left")} className="auth-eye">
                <span ref={setPupilRef("a-left")} className="auth-pupil" />
              </div>
              <div ref={setEyeRef("a-right")} className="auth-eye">
                <span ref={setPupilRef("a-right")} className="auth-pupil" />
              </div>
            </div>
            <div className="auth-mouth auth-mouth-smile" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthExperience({ onBack, onLoginSuccess }: AuthExperienceProps) {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [gazeMode, setGazeMode] = useState<GazeMode>("mouse");
  const [showPassword, setShowPassword] = useState(false);
  const [accountBias, setAccountBias] = useState(0);
  const [trackedField, setTrackedField] = useState<HTMLInputElement | null>(null);
  const [surpriseSignal, setSurpriseSignal] = useState(0);

  const [loginForm, setLoginForm] = useState({ account: "", password: "", remember: true });
  const [registerForm, setRegisterForm] = useState({
    account: "",
    password: "",
    confirmPassword: "",
  });

  const pointerRef = useRef({ x: 0, y: 0 });
  const blurTimerRef = useRef<number | null>(null);

  const loginPasswordRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    pointerRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    return () => {
      if (blurTimerRef.current !== null) window.clearTimeout(blurTimerRef.current);
    };
  }, []);

  const clearBlurTimer = () => {
    if (blurTimerRef.current !== null) {
      window.clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
  };

  const updateAccountBias = (input: HTMLInputElement) => {
    const caret = input.selectionStart ?? input.value.length;
    setAccountBias(clamp(caret * 2.2, 0, 44));
  };

  const focusAccount = (input: HTMLInputElement) => {
    clearBlurTimer();
    setTrackedField(input);
    updateAccountBias(input);
    setGazeMode("account");
  };

  const focusPassword = (input: HTMLInputElement, visible: boolean) => {
    clearBlurTimer();
    setTrackedField(input);
    setAccountBias(0);
    setGazeMode(visible ? "passwordVisible" : "passwordHidden");
  };

  const handleFieldBlur = () => {
    clearBlurTimer();
    blurTimerRef.current = window.setTimeout(() => {
      if (!(document.activeElement instanceof HTMLInputElement)) {
        setTrackedField(null);
        setAccountBias(0);
        setGazeMode("mouse");
      }
    }, 0);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    pointerRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleToggleMode = (nextMode: AuthMode) => {
    setAuthMode(nextMode);
    setTrackedField(null);
    setAccountBias(0);
    setShowPassword(false);
    setGazeMode("mouse");
  };

  const handlePasswordVisibility = () => {
    setShowPassword((current) => {
      const next = !current;
      const input = loginPasswordRef.current;
      if (input) {
        input.focus();
        setTrackedField(input);
        setGazeMode(next ? "passwordVisible" : "passwordHidden");
      }
      if (next) setSurpriseSignal((value) => value + 1);
      return next;
    });
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const account = loginForm.account.trim();
    const password = loginForm.password;

    if (!account || !password) {
      alert("账号和密码不能为空。");
      return;
    }

    try {
      const token = await login({
        username: account,
        password,
      });

      onLoginSuccess?.(getDisplayName(token) || account);
    } catch (error) {
      alert(getErrorMessage(error, "登录失败，请检查后端服务是否已启动。"));
    }
  };

    const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const account = registerForm.account.trim();
    const password = registerForm.password;
    const confirmPassword = registerForm.confirmPassword;

    if (!account || !password) {
      alert("账号和密码不能为空。");
      return;
    }
    if (password !== confirmPassword) {
      alert("两次输入的密码不一致。");
      return;
    }

    try {
      await register({
        username: account,
        password,
      });

      alert("注册成功，正在切换到登录界面。");
      handleToggleMode("login");
      setLoginForm((prev) => ({ ...prev, account, password: "" }));
    } catch (error) {
      alert(getErrorMessage(error, "注册失败，请检查后端服务是否可用。"));
    }
  };
  return (
    <section onPointerMove={handlePointerMove} className="relative min-h-screen px-6 py-12 md:py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[6%] left-[8%] h-72 w-72 rounded-full bg-indigo-300/22 blur-[105px]" />
        <div className="absolute right-[8%] bottom-[12%] h-72 w-72 rounded-full bg-pink-300/22 blur-[105px]" />
        <div className="absolute top-[36%] left-[36%] h-80 w-80 rounded-full bg-cyan-300/18 blur-[110px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto w-full max-w-6xl rounded-[2.5rem] border border-white/70 bg-white/42 p-4 shadow-[0_30px_95px_rgba(94,75,164,0.17)] backdrop-blur-[26px] md:p-6"
      >
        <div className="grid gap-6 lg:grid-cols-[1.12fr_1fr]">
          <motion.div
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08, duration: 0.45 }}
          >
            <CharacterStage
              gazeMode={gazeMode}
              pointerRef={pointerRef}
              trackedField={trackedField}
              accountBias={accountBias}
              surpriseSignal={surpriseSignal}
            />
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/75 bg-white/72 p-6 shadow-[0_22px_70px_rgba(99,102,241,0.12)] backdrop-blur-2xl sm:p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(167,139,250,0.16),transparent_60%)]" />
            <div className="relative z-10">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center rounded-full border border-white/80 bg-white/85 p-1 shadow-[0_8px_25px_rgba(15,23,42,0.08)]">
                  <button
                    type="button"
                    onClick={() => handleToggleMode("login")}
                    className={`auth-mode-tab ${authMode === "login" ? "is-active" : ""}`}
                  >
                    登录
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleMode("register")}
                    className={`auth-mode-tab ${authMode === "register" ? "is-active" : ""}`}
                  >
                    注册账号
                  </button>
                </div>

                {onBack ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    返回首页
                  </button>
                ) : null}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {authMode === "login" ? (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28 }}
                    onSubmit={handleLoginSubmit}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="text-[clamp(1.8rem,3vw,2.25rem)] font-semibold text-slate-900">欢迎回来</h2>
                      <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                        继续你的记录旅程，让每一条灵感都被妥善保存。
                      </p>
                    </div>

                    <label className="auth-field-block">
                      <span className="auth-field-label">账号</span>
                      <input
                        type="text"
                        value={loginForm.account}
                        placeholder="请输入账号"
                        className="auth-field"
                        onFocus={(event) => focusAccount(event.currentTarget)}
                        onBlur={handleFieldBlur}
                        onClick={(event) => updateAccountBias(event.currentTarget)}
                        onKeyUp={(event) => updateAccountBias(event.currentTarget)}
                        onChange={(event) => {
                          setLoginForm((prev) => ({ ...prev, account: event.target.value }));
                          updateAccountBias(event.currentTarget);
                        }}
                      />
                    </label>

                    <label className="auth-field-block">
                      <span className="auth-field-label">密码</span>
                      <div className="relative">
                        <input
                          ref={loginPasswordRef}
                          type={showPassword ? "text" : "password"}
                          value={loginForm.password}
                          placeholder="请输入密码"
                          className="auth-field pr-20"
                          onFocus={(event) => focusPassword(event.currentTarget, showPassword)}
                          onBlur={handleFieldBlur}
                          onChange={(event) => {
                            setLoginForm((prev) => ({ ...prev, password: event.target.value }));
                          }}
                        />
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={handlePasswordVisibility}
                          className="absolute top-1/2 right-3 inline-flex -translate-y-1/2 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-white/70 hover:text-slate-700"
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          {showPassword ? "隐藏" : "显示"}
                        </button>
                      </div>
                    </label>

                    <div className="flex items-center justify-between text-sm">
                      <label className="inline-flex items-center gap-2 text-slate-600">
                        <input
                          type="checkbox"
                          checked={loginForm.remember}
                          onChange={(event) => {
                            setLoginForm((prev) => ({ ...prev, remember: event.target.checked }));
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-300"
                        />
                        记住我
                      </label>
                      <button type="button" className="font-medium text-slate-500 transition-colors hover:text-slate-700">
                        忘记密码？
                      </button>
                    </div>

                    <button type="submit" className="auth-primary-button">
                      登录
                    </button>

                    <p className="text-center text-sm text-slate-600">
                      还没有账号？
                      <button
                        type="button"
                        className="ml-1 font-semibold text-indigo-500 transition-colors hover:text-indigo-600"
                        onClick={() => handleToggleMode("register")}
                      >
                        注册账号
                      </button>
                    </p>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28 }}
                    onSubmit={handleRegisterSubmit}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="text-[clamp(1.8rem,3vw,2.25rem)] font-semibold text-slate-900">创建账号</h2>
                      <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                        准备好了的话，创建账号后就可以开始记录和管理你的笔记。
                      </p>
                    </div>

                    <label className="auth-field-block">
                      <span className="auth-field-label">账号</span>
                      <input
                        type="text"
                        value={registerForm.account}
                        placeholder="设置账号"
                        className="auth-field"
                        onFocus={(event) => focusAccount(event.currentTarget)}
                        onBlur={handleFieldBlur}
                        onClick={(event) => updateAccountBias(event.currentTarget)}
                        onKeyUp={(event) => updateAccountBias(event.currentTarget)}
                        onChange={(event) => {
                          setRegisterForm((prev) => ({ ...prev, account: event.target.value }));
                          updateAccountBias(event.currentTarget);
                        }}
                      />
                    </label>

                    <label className="auth-field-block">
                      <span className="auth-field-label">密码</span>
                      <input
                        type="password"
                        value={registerForm.password}
                        placeholder="设置密码"
                        className="auth-field"
                        onFocus={(event) => focusPassword(event.currentTarget, false)}
                        onBlur={handleFieldBlur}
                        onChange={(event) => {
                          setRegisterForm((prev) => ({ ...prev, password: event.target.value }));
                        }}
                      />
                    </label>

                    <label className="auth-field-block">
                      <span className="auth-field-label">确认密码</span>
                      <input
                        type="password"
                        value={registerForm.confirmPassword}
                        placeholder="再次输入密码"
                        className="auth-field"
                        onFocus={(event) => focusPassword(event.currentTarget, false)}
                        onBlur={handleFieldBlur}
                        onChange={(event) => {
                          setRegisterForm((prev) => ({ ...prev, confirmPassword: event.target.value }));
                        }}
                      />
                    </label>

                    <button type="submit" className="auth-primary-button">
                      注册账号
                    </button>

                    <p className="text-center text-sm text-slate-600">
                      已有账号？
                      <button
                        type="button"
                        className="ml-1 font-semibold text-indigo-500 transition-colors hover:text-indigo-600"
                        onClick={() => handleToggleMode("login")}
                      >
                        去登录
                      </button>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </div>
      </motion.div>
    </section>
  );
}

