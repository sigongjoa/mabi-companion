### **글로벌 디자인 요소 (Global Design Elements)**

이러한 요소들은 애플리케이션 전체에 일관되게 적용되는 디자인 규칙입니다. 주로 Tailwind CSS 설정 파일, 전역 CSS 파일, 그리고 Shadcn UI 컴포넌트 설정에서 정의됩니다.

1.  **Tailwind CSS 설정 (`tailwind.config.ts`)**:
    *   **색상 팔레트**: `primary`, `secondary`, `accent`, `destructive`, `muted`, `popover`, `card`, `border`, `input`, `ring`, `background`, `foreground` 등 Shadcn UI에서 정의하는 기본 색상들이 있습니다. 이들은 `hsl` (Hue, Saturation, Lightness) 값을 기반으로 정의되어 있어, 색조 변경이 용이합니다.
    *   **폰트**: 현재 `font-sans`는 `var(--font-sans)`로 설정되어 있으며, 이는 `app/layout.tsx`에서 Google Fonts의 `Inter` 폰트를 사용하도록 설정되어 있습니다.
    *   **그림자 (Shadows)**: Tailwind의 기본 그림자 유틸리티 클래스 (`shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`)가 사용됩니다.
    *   **반응형 디자인 (Breakpoints)**: Tailwind의 기본 반응형 브레이크포인트 (`sm`, `md`, `lg`, `xl`, `2xl`)를 사용하여 다양한 화면 크기에 맞춰 레이아웃이 조정됩니다.
    *   **기타 확장**: `borderRadius`, `keyframes`, `animation` 등 Tailwind의 기본 설정을 확장하거나 커스터마이징한 부분이 있을 수 있습니다.

2.  **전역 CSS (`app/globals.css`)**:
    *   **기본 스타일 재정의**: `body`, `h1`, `p` 등 HTML 기본 요소에 대한 전역적인 CSS 재정의가 포함될 수 있습니다.
    *   **커스텀 CSS 변수**: Tailwind 설정에서 사용되는 `hsl` 값의 기반이 되는 `--background`, `--foreground` 등의 CSS 변수들이 정의되어 있습니다. 이 변수들을 변경하면 전체적인 테마 색상이 바뀝니다.
    *   **유틸리티 클래스**: Tailwind 클래스 외에 프로젝트에서 자주 사용되는 커스텀 유틸리티 클래스 (예: `modern-card`, `office-card`, `excel-header`, `office-table`, `excel-scrollbar` 등)가 정의되어 있습니다. 이들은 특정 컴포넌트나 섹션에 일관된 스타일을 적용하는 데 사용됩니다.

3.  **Shadcn UI 컴포넌트 설정 (`components.json`)**:
    *   Shadcn UI는 Tailwind CSS를 기반으로 하는 컴포넌트 라이브러리입니다. `components.json`은 Shadcn UI 컴포넌트의 기본 스타일, 테마, 그리고 사용되는 CSS 변수 등을 정의합니다. 이 파일은 컴포넌트의 `border-radius`, `color` 등 기본적인 시각적 속성에 영향을 미칩니다.

---

### **페이지별 디자인 요소 (Per-Page Design Elements)**

이러한 요소들은 특정 페이지나 컴포넌트 내에서 직접 Tailwind CSS 클래스를 사용하거나, 해당 페이지/컴포넌트에만 적용되는 커스텀 CSS를 통해 정의됩니다.

1.  **레이아웃**:
    *   각 페이지의 최상위 `div`에는 `p-6 space-y-6 bg-gray-50 min-h-screen`과 같은 Tailwind 클래스가 적용되어 기본적인 패딩, 요소 간 간격, 배경색, 최소 높이 등을 설정합니다.
    *   `grid`, `flex` 등의 Tailwind 유틸리티 클래스를 사용하여 섹션 내의 요소들을 배치합니다. (예: `grid grid-cols-2 md:grid-cols-3 gap-4`)

2.  **컴포넌트 스타일**:
    *   `Card`, `Button`, `Input`, `Table` 등 Shadcn UI에서 제공하는 컴포넌트들은 기본적으로 글로벌 스타일을 따르지만, 각 페이지에서 추가적인 Tailwind 클래스를 통해 커스터마이징될 수 있습니다. (예: `className="bg-blue-600 hover:bg-blue-700 text-white"`)
    *   `app/globals.css`에 정의된 `modern-card`, `office-card`와 같은 커스텀 클래스들이 특정 페이지의 카드 컴포넌트에 적용되어 일관된 시각적 테마를 유지합니다.

3.  **텍스트 및 타이포그래피**:
    *   `text-xl`, `font-bold`, `text-gray-900` 등 Tailwind의 텍스트 관련 클래스를 사용하여 제목, 부제목, 본문 텍스트의 크기, 굵기, 색상 등을 페이지별로 조정합니다.

4.  **아이콘 및 시각적 요소**:
    *   `lucide-react`에서 가져온 아이콘들은 `w-8 h-8 text-blue-600`와 같은 클래스를 통해 크기와 색상이 조정됩니다.
    *   `Badge` 컴포넌트의 `variant` prop을 통해 다양한 색상과 스타일의 배지를 사용할 수 있습니다.

---

### **디자인 변경을 위한 접근 방식**

*   **전역적인 변경**: `tailwind.config.ts`와 `app/globals.css` 파일을 수정하여 색상 팔레트, 폰트, 기본 컴포넌트 스타일 등을 변경하면 애플리케이션 전체에 영향을 미칩니다. 특히 `app/globals.css`의 CSS 변수들을 조정하는 것이 가장 큰 영향을 줄 수 있습니다.
*   **특정 컴포넌트 변경**: `components.json`을 통해 Shadcn UI 컴포넌트의 기본 스타일을 변경하거나, 각 컴포넌트 파일 (`components/ui/*.tsx`)에서 직접 스타일을 수정할 수 있습니다.
*   **페이지별 변경**: 각 페이지 파일 (`app/**/*.tsx`) 내에서 Tailwind CSS 클래스를 추가하거나 수정하여 해당 페이지의 레이아웃이나 특정 요소의 스타일을 변경할 수 있습니다. `app/globals.css`에 새로운 커스텀 유틸리티 클래스를 정의하고 이를 페이지에서 사용하는 것도 좋은 방법입니다.
