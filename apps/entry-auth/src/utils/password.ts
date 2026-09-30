/**
 * 비밀번호 최대 길이. 백엔드(identity)는 bcrypt 한계에 맞춰 글자 수가 아니라 UTF-8 72바이트까지 받는다
 * (`SignupRequest.password`·`PasswordResetRequest.newPassword` 의 `@Utf8ByteLength(max = 72)`).
 * 영문·숫자·특수문자는 1바이트라 72자, 한글은 3바이트라 24자까지다.
 */
export const PASSWORD_MAX_UTF8_BYTES = 72;

export const PASSWORD_TOO_LONG_MESSAGE = "비밀번호는 영문·숫자·특수문자 기준 72자 이하로 입력해 주세요.";

export const isPasswordWithinByteLimit = (password: string) =>
  new TextEncoder().encode(password).length <= PASSWORD_MAX_UTF8_BYTES;
