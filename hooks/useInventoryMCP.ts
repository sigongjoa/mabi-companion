import { useCallback } from "react";
import { createToolCall } from "@/lib/toolDefinitions";
import OpenAI from "openai";
import logger from "@/app/logger";
import { ParsedInventory, InventoryItem, InventoryPageContext } from "@/types/page-context";

export function useInventoryMCP(openai: OpenAI, userId: string) {
  logger.debug("Entering useInventoryMCP");

  const ctx: InventoryPageContext = {
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

  const parseAndUpdate = useCallback(async (imageBase64FromInput?: string) => {
    logger.debug("Entering parseAndUpdate");
    try {
      const imageBase64 = imageBase64FromInput || await captureImage();
      logger.debug("Calling parse_inventory_image tool");
      const parseRes = await createToolCall(openai, "parse_inventory_image", { imageBase64 });
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