import { Router, type Request, type Response } from "express";
import { authContextMiddleware } from "../../middleware/authContext.js";
import InstitutionalCopilotChat, {
  type AIAnalystRole,
  type InstitutionalCopilotContext
} from "../../modules/ai/institutionalCopilotChat.js";

export const institutionalCopilotRouter = Router();

const copilotService = new InstitutionalCopilotChat();

// Apply auth middleware to all routes
institutionalCopilotRouter.use(authContextMiddleware);

/**
 * POST /ai/institutional-chat
 * 
 * Institutional chat endpoint for coverage strategy analysis and institutional positioning inquiry.
 * Accepts institutional zones, coverage strategies, and user question.
 * 
 * Roles: analyst, risk_manager (controlled by request payload)
 * Read-only: No data mutations
 */
institutionalCopilotRouter.post("/institutional-chat", async (req: Request, res: Response) => {
  try {
    const {
      ticker,
      currentPrice,
      zones,
      coverageStrategies,
      question,
      userRole
    }: {
      ticker: string;
      currentPrice: number;
      zones: any;
      coverageStrategies: any[];
      question: string;
      userRole?: AIAnalystRole;
    } = req.body;

    // Validate required fields
    if (!ticker || typeof currentPrice !== "number" || !zones || !question) {
      return res.status(400).json({
        code: "INSTITUTIONAL_COPILOT_INVALID_INPUT",
        message: "Missing required fields: ticker, currentPrice, zones, question"
      });
    }

    // Determine user role for AI analysis
    // If userRole is not provided, infer from authContext role
    const role: AIAnalystRole = userRole || inferAIRole(req.authContext?.role ?? "viewer");

    // Create context
    const contextId = `copilot-context-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const context: InstitutionalCopilotContext = {
      contextId,
      ticker,
      currentPrice,
      zones,
      coverageStrategies: coverageStrategies || [],
      question,
      userRole: role,
      requestedAt: new Date().toISOString()
    };

    const response = await copilotService.submit(context);

    if ("status" in response && response.status === "pending") {
      return res.status(202).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error in institutional copilot.";
    console.error("InstitutionalCopilot error:", message);

    return res.status(500).json({
      code: "INSTITUTIONAL_COPILOT_ERROR",
      message,
      ai_unavailable: true
    });
  }
});

institutionalCopilotRouter.get("/institutional-chat/poll/:responseId", async (req: Request, res: Response) => {
  try {
    const { responseId } = req.params;

    if (!responseId) {
      return res.status(400).json({
        code: "INSTITUTIONAL_COPILOT_INVALID_INPUT",
        message: "responseId is required"
      });
    }

    const result = await copilotService.poll(responseId);

    if ("status" in result && result.status === "pending") {
      return res.status(202).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error while polling institutional copilot.";
    console.error("InstitutionalCopilot poll error:", message);

    return res.status(500).json({
      code: "INSTITUTIONAL_COPILOT_POLL_ERROR",
      message,
      ai_unavailable: true
    });
  }
});

/**
 * Helper: infer AI role from Express auth role
 * - admin, trader -> analyst
 * - viewer -> risk_manager (limited)
 */
function inferAIRole(authRole: string): AIAnalystRole {
  if (authRole === "admin" || authRole === "trader") {
    return "analyst";
  }
  return "risk_manager"; // Default for viewer
}

export default institutionalCopilotRouter;
