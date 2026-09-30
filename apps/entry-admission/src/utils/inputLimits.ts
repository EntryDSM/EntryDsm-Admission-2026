/**
 * 원서 입력칸 최대 글자 수. 백엔드(application 시스템)가 저장 때 거절하는 길이와 맞춘다.
 * 넘기면 저장이 400·409 로 실패하는데 화면에는 어느 칸인지 알려주지 못하므로 입력칸에서 미리 막는다.
 */

/** 지원자 성명. `UpdatePersonalRequest.name` @Size(max = 20) */
export const APPLICANT_NAME_MAX_LENGTH = 20;

/** 보호자 성명. `UpdateFamilyRequest.guardianName` @Size(max = 20) */
export const GUARDIAN_NAME_MAX_LENGTH = 20;

/** 지원자와의 관계(기타). 요청 DTO 에는 제한이 없지만 DB 컬럼 `applicants.guardian_relation` 이 VARCHAR(10) 이다. */
export const GUARDIAN_RELATION_MAX_LENGTH = 10;

/**
 * 상세주소. DTO 는 255자까지 받지만 암호화(AES-GCM, `v1.<iv>.<암호문>` base64url)한 값이 VARCHAR(512) 에 들어가야 해서
 * 평문이 UTF-8 353바이트(한글 약 117자)를 넘으면 DB 저장이 실패한다. 어떤 글자로 채워도 300바이트 이하인 100자로 막는다.
 */
export const ADDRESS_DETAIL_MAX_LENGTH = 100;

/** 중학교 교사 성명. `UpdateMiddleSchoolRequest.teacherName` @Size(max = 20) */
export const TEACHER_NAME_MAX_LENGTH = 20;
