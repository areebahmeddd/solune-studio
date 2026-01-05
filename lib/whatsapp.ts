/**
 * WhatsApp Business API Integration
 * Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  apiVersion: string;
}

export interface SendMessageParams {
  to: string;
  message: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: number;
  errorType?: string;
}

/**
 * Format phone number to WhatsApp format (no + or spaces, just digits)
 * Example: +91 9876543210 -> 919876543210
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (!cleaned.startsWith("91") && cleaned.length === 10) {
    return "91" + cleaned;
  }

  return cleaned;
}

/**
 * Send a text message via WhatsApp Business API
 */
export async function sendWhatsAppMessage(
  config: WhatsAppConfig,
  params: SendMessageParams,
): Promise<WhatsAppResponse> {
  const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

  const formattedPhone = formatPhoneNumber(params.to);

  if (!formattedPhone || formattedPhone.length < 10) {
    return {
      success: false,
      error: "Invalid phone number format",
      errorCode: 400,
      errorType: "INVALID_PARAMETER",
    };
  }

  try {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedPhone,
      type: "text",
      text: {
        preview_url: false,
        body: params.message,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || "Failed to send message";
      const errorCode = data.error?.code || response.status;
      const errorType = data.error?.type || "API_ERROR";

      return {
        success: false,
        error: errorMessage,
        errorCode,
        errorType,
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      errorCode: 500,
      errorType: "NETWORK_ERROR",
    };
  }
}

/**
 * Send messages to multiple recipients with rate limiting and retry logic
 * WhatsApp recommends 80-100 messages per second maximum
 */
export async function sendBulkWhatsAppMessages(
  config: WhatsAppConfig,
  recipients: Array<{ phone: string; message: string }>,
  delayBetweenMessages: number = 1000,
): Promise<
  Array<{
    phone: string;
    success: boolean;
    error?: string;
    messageId?: string;
    retried?: boolean;
  }>
> {
  const results: Array<{
    phone: string;
    success: boolean;
    error?: string;
    messageId?: string;
    retried?: boolean;
  }> = [];

  for (const recipient of recipients) {
    let result = await sendWhatsAppMessage(config, {
      to: recipient.phone,
      message: recipient.message,
    });

    if (
      !result.success &&
      result.errorCode &&
      [429, 500, 503].includes(result.errorCode)
    ) {
      await new Promise((resolve) =>
        setTimeout(resolve, delayBetweenMessages * 2),
      );
      result = await sendWhatsAppMessage(config, {
        to: recipient.phone,
        message: recipient.message,
      });

      results.push({
        phone: recipient.phone,
        success: result.success,
        error: result.error,
        messageId: result.messageId,
        retried: true,
      });
    } else {
      results.push({
        phone: recipient.phone,
        success: result.success,
        error: result.error,
        messageId: result.messageId,
      });
    }

    if (recipients.indexOf(recipient) < recipients.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenMessages));
    }
  }

  return results;
}
