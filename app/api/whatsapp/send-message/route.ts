import { sendBulkWhatsAppMessages } from "@/lib/whatsapp";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const apiVersion = process.env.WHATSAPP_API_VERSION;

    if (!phoneNumberId || !accessToken || !apiVersion) {
      return NextResponse.json(
        {
          success: false,
          error: "WhatsApp API credentials not configured.",
        },
        { status: 500 },
      );
    }

    const body = await req.json();
    const { recipients } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid recipients data" },
        { status: 400 },
      );
    }

    const results = await sendBulkWhatsAppMessages(
      {
        phoneNumberId,
        accessToken,
        apiVersion,
      },
      recipients,
      1000,
    );

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        succeeded: successCount,
        failed: failureCount,
      },
    });
  } catch (error) {
    console.error("WhatsApp API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
