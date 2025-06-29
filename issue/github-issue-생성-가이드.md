# GitHub 이슈 생성 가이드 (gh CLI 사용)

이 문서는 `gh` (GitHub CLI) 명령어를 사용하여 GitHub 저장소에 이슈를 생성하는 방법을 안내합니다. 특히, 터미널을 통해 이슈를 자동으로 생성하는 예시를 제공합니다.

## 기본 명령어 형식

```bash
gh issue create \
  --repo <OWNER>/<REPO> \
  --title "<이슈 제목>" \
  --body "<이슈 본문 내용>" \
  --label <레이블1>,<레이블2> \
  [--assignee @me] # 선택 사항: 자신에게 할당
```

**설명:**

*   `--repo <OWNER>/<REPO>`: 이슈를 생성할 GitHub 저장소의 소유자(Owner)와 저장소 이름(Repository)을 지정합니다. (예: `sigongjoa/mabi-companion`)
*   `--title "<이슈 제목>"`: 이슈의 제목을 설정합니다.
*   `--body "<이슈 본문 내용>"`: 이슈의 상세 내용을 직접 문자열로 제공합니다. 여러 줄은 `\n`으로 구분할 수 있습니다.
*   `--body-file <파일 경로>`: `--body` 대신 외부 파일에서 이슈 본문 내용을 읽어올 때 사용합니다. 특히 긴 내용에 유용합니다. (WSL 환경에서는 리눅스 경로 사용. 예: `/tmp/issue_body.md` 또는 `/mnt/d/your/path/issue_body.md`)
*   `--label <레이블1>,<레이블2>`: 이슈에 적용할 레이블을 쉼표로 구분하여 지정합니다.
*   `--assignee @me`: 이슈를 자신에게 할당합니다. (선택 사항)

## 예시: "타이머 데이터 관련 TypeError" 이슈 생성

이전에 발생했던 "타이머 데이터 관련 TypeError"를 GitHub 이슈로 생성하는 명령어 예시입니다.

```bash
gh issue create \
  --repo sigongjoa/mabi-companion \
  --title "버그: 타이머 데이터 관련 TypeError" \
  --body "## 발생 이유\napp/page.tsx 및 app/timers/page.tsx의 handleCurrencyDataChange 함수에서 data.nextChargeTime.toISOString() 호출이 불필요하게 다시 발생하여, 이미 ISO 문자열로 변환된 값을 다시 toISOString()으로 변환하려고 시도하여 발생한 타입 에러입니다.\n\n## 재현 절차\n1. 타이머 탭으로 이동합니다.\n2. 통화 타이머 데이터를 수정합니다.\n3. 대시보드 탭으로 이동하거나 페이지를 새로고침합니다.\n4. 콘솔에서 TypeError가 발생하는지 확인합니다.\n\n## 기대 동작\n타이머 데이터 수정 시 TypeError 없이 정상적으로 데이터가 처리되고 반영됩니다.\n\n## 환경\n- Next.js\n- Clerk (데이터 저장/관리 관련)" \
  --label bug
```

**참고:**

*   위 예시에서는 `--body` 플래그를 사용하여 본문 내용을 직접 전달했습니다. 내용이 길거나 복잡한 경우 별도의 `.md` 파일을 생성하고 `--body-file` 플래그를 사용하는 것이 좋습니다.
*   WSL 환경에서 `--body-file`을 사용할 경우, 파일 경로가 WSL 내부의 리눅스 경로(`~`, `/tmp`, `/mnt/d/your/path` 등)를 따르는지 확인해야 합니다. 