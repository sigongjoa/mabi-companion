# 아이템 페이지용 MCP + Tool-Call 설계 가이드

아래 가이드라인에 따라 "아이템 페이지" 전용 MCP 와 멀티모달 Tool-Call 워크플로우를 설계합니다.

---

## 1. 컨텍스트 범위 정의 (Scope)

- **읽기 전용 (Resource)**  
  - `pageType`: `"inventoryPage"`  
  - `userId`: 사용자 식별자  
- **수정 가능 (Tool)**  
  1.  `parse_inventory_image`  
      - 스크린샷 이미지를 분석해 아이템별 수량(JSON) 반환  
  2.  `update_inventory_counts`  
      - 분석 결과를 서버/DB에 반영하고 UI 갱신  

---

## 2. 데이터 모델링 (TypeScript 인터페이스 & JSON 스키마)

\`\`\`ts
// PageContext
interface PageContext {
  version: string;                    // ex. "1.0.0"
  pageType: "inventoryPage";          // 페이지 구분 플래그
  userId: string;                     // 사용자 ID
}

// 분석된 인벤토리 데이터
interface InventoryItem {
  id: number;
  name: string;
  count: number;
}

interface ParsedInventory {
  items: InventoryItem[];
  totalWeight?: number;               // ex. 245.26 / 420
}
\`\`\`

\`\`\`ts
// OpenAI Function-Call 스키마
export const openAIFunctions = [
  {
    name: "parse_inventory_image",
    description: "인벤토리 스크린샷을 분석해 아이템별 수량을 반환합니다.",
    parameters: {
      type: "object",
      properties: {
        imageBase64: { type: "string" }
      },
      required: ["imageBase64"]
    }
  },
  {
    name: "update_inventory_counts",
    description: "아이템 페이지(inventoryPage)에 분석 결과를 반영합니다.",
    parameters: {
      type: "object",
      properties: {
        pageContext: {
          type: "object",
          properties: {
            version: { type: "string" },
            pageType: { type: "string", enum: ["inventoryPage"] },
            userId: { type: "string" }
          },
          required: ["version", "pageType", "userId"]
        },
        parsedInventory: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  name: { type: "string" },
                  count: { type: "number" }
                },
                required: ["id","name","count"]
              }
            },
            totalWeight: { type: "number" }
          },
          required: ["items"]
        }
      },
      required: ["pageContext","parsedInventory"]
    }
  }
];
\`\`\`

## 3. 상태 수집 & 이미지 캡처 (Gathering)

\`\`\`ts
// hooks/useInventoryMCP.ts
import { useCallback } from "react";
import { createToolCall } from "@/lib/toolDefinitions";
import { OpenAIApi } from "openai";
import { logger } from "@/app/logger"; // logger import 추가

interface PageContext {
  version: string;
  pageType: "inventoryPage";
  userId: string;
}

interface InventoryItem {
  id: number;
  name: string;
  count: number;
}

interface ParsedInventory {
  items: InventoryItem[];
  totalWeight?: number;
}

export function useInventoryMCP(openai: OpenAIApi, userId: string) {
  logger.debug("Entering useInventoryMCP");

  const ctx: PageContext = {
    version: "1.0.0",
    pageType: "inventoryPage",
    userId
  };

  const captureImage = useCallback(async (): Promise<string> => {
    logger.debug("Entering captureImage");
    try {
      const img = document.querySelector<HTMLImageElement>("#inventory-screenshot")!;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      const imageData = canvas.toDataURL("image/png").split(",")[1];
      logger.debug("Image captured and encoded to Base64");
      return imageData;
    } catch (error) {
      logger.debug(`Error in captureImage: ${error}`);
      throw error;
    } finally {
      logger.debug("Exiting captureImage");
    }
  }, []);

  const parseAndUpdate = useCallback(async () => {
    logger.debug("Entering parseAndUpdate");
    try {
      const imageBase64 = await captureImage();
      logger.debug("Calling parse_inventory_image tool");
      const parseRes = await createToolCall(openai, "parse_inventory_image", { imageBase64 });
      logger.debug(`parse_inventory_image response: ${JSON.stringify(parseRes)}`);
      const parsed: ParsedInventory = JSON.parse(parseRes.data.choices[0].message.function_call.arguments);
      logger.debug(`Parsed inventory: ${JSON.stringify(parsed)}`);
      logger.debug("Calling update_inventory_counts tool");
      await createToolCall(openai, "update_inventory_counts", { parsedInventory: parsed }, ctx);
      logger.debug("Inventory counts updated");
      return parsed;
    } catch (error) {
      logger.debug(`Error in parseAndUpdate: ${error}`);
      throw error;
    } finally {
      logger.debug("Exiting parseAndUpdate");
    }
  }, [captureImage, openai, ctx]);

  logger.debug("Exiting useInventoryMCP");
  return { parseAndUpdate };
}
\`\`\`

## 4. 직렬화 & 호출 흐름 (Serialization & Invocation)

\`\`\`tsx
// components/InventoryPage.tsx
import { useInventoryMCP } from "@/hooks/useInventoryMCP";
import { OpenAIApi } from "openai";
import { useState } from "react";
import { logger } from "@/app/logger"; // logger import 추가

interface InventoryItem {
  id: number;
  name: string;
  count: number;
}

interface ParsedInventory {
  items: InventoryItem[];
  totalWeight?: number;
}

export function InventoryPage() {
  logger.debug("Entering InventoryPage component");
  const openai = new OpenAIApi({ apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY });
  const { parseAndUpdate } = useInventoryMCP(openai, "user-123");
  const [inventory, setInventory] = useState<ParsedInventory>({ items: [] });

  return (
    <div>
      {/* 스크린샷 이미지는 보이지 않게 렌더링 */}
      <img id="inventory-screenshot" src="/inventory.png" hidden />

      <button onClick={async () => {
        logger.debug("Inventory scan button clicked");
        try {
          const parsed = await parseAndUpdate();
          setInventory(parsed);
          logger.debug("Inventory updated in state");
        } catch (error) {
          logger.debug(`Error during inventory scan and update: ${error}`);
        }
      }}>
        인벤토리 스캔 및 업데이트
      </button>

      <ul>
        {inventory.items.map(i => (
          <li key={i.id}>{i.name}: {i.count}개</li>
        ))}
      </ul>
      {logger.debug("Exiting InventoryPage component rendering")} 
    </div>
  );
}
\`\`\`

## 5. 보안 · 성능 · 테스트

*   **이미지 크기**: `canvas.toDataURL("image/png", 0.7)` 등으로 최적화
*   **민감 정보 제거**: `userId` 외 개인정보 배제
*   **유닛 테스트**:
    *   `gatherPageContext()` / `useInventoryMCP` 동작 검증
    *   Function-Call 응답 스텁 테스트
*   **로깅**:
    *   `console.debug(ctx)` 및 응답 결과 출력
